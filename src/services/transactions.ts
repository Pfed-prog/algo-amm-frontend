import MyAlgoConnect from "@randlabs/myalgo-connect";
import algosdk from "algosdk";

import { connectAlgod, waitForConfirmation } from "../utils/connectAlgod";
import { appId, usdcId, contractAddress } from "../contracts";

import { GlobalStateIndeces } from "../store/types";

const algodClient = connectAlgod();

export const swap = async (
  usdcAmount: number,
  tokenName: string,
  poolToken: number,
  yesToken: number,
  noToken: number,
  selectedAddress: string,
  setResponse: Function
) => {
  try {
    var choice = "";
    if (tokenName == "Yes") {
      choice = "buy_yes";
    }
    if (tokenName == "No") {
      choice = "buy_no";
    }

    const params = await algodClient.getTransactionParams().do();

    const enc = new TextEncoder();

    const accounts = undefined;
    const foreignApps = undefined;
    const foreignAssets = [usdcId, poolToken, yesToken, noToken];
    const closeRemainderTo = undefined;
    const note = undefined;
    const amount = 2000;

    usdcAmount = usdcAmount * 1000000;

    const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
      selectedAddress,
      contractAddress,
      amount,
      closeRemainderTo,
      note,
      params
    );

    const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: {
        ...params,
      },
      from: selectedAddress,
      to: contractAddress,
      assetIndex: usdcId,
      amount: usdcAmount,
      note: note,
    });

    const txn3 = algosdk.makeApplicationNoOpTxn(
      selectedAddress,
      params,
      appId,
      [enc.encode("swap"), enc.encode(choice)],
      accounts,
      foreignApps,
      foreignAssets
    );

    const txnsArray = [txn1, txn2, txn3];
    const groupID = algosdk.computeGroupID(txnsArray);
    for (let i = 0; i < 3; i++) txnsArray[i].group = groupID;

    const myAlgoConnect = new MyAlgoConnect();
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );
    const response = await algodClient
      .sendRawTransaction(signedTxns.map((tx) => tx.blob))
      .do();
    await waitForConfirmation(algodClient, response.txId, 4);

    setResponse(response);

    console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
  } catch (err) {
    console.error(err);
  }
};

export const redeem = async (
  tokenAmount: number,
  tokenName: string,
  yesToken: number,
  noToken: number,
  selectedAddress: string,
  setResponse: Function
) => {
  try {
    let tokenId = 0;
    if (tokenName == "Yes") {
      tokenId = yesToken;
    }
    if (tokenName == "No") {
      tokenId = noToken;
    }

    const params = await algodClient.getTransactionParams().do();

    const enc = new TextEncoder();

    const accounts = undefined;
    const foreignApps = undefined;
    const foreignAssets = [usdcId, tokenId];
    const closeRemainderTo = undefined;
    const note = undefined;
    const amount = 2000;

    tokenAmount = tokenAmount * 1000000;

    const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
      selectedAddress,
      contractAddress,
      amount,
      closeRemainderTo,
      note,
      params
    );

    const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: {
        ...params,
      },
      from: selectedAddress,
      to: contractAddress,
      assetIndex: tokenId,
      amount: tokenAmount,
      note: note,
    });

    const txn3 = algosdk.makeApplicationNoOpTxn(
      selectedAddress,
      params,
      appId,
      [enc.encode("redeem")],
      accounts,
      foreignApps,
      foreignAssets
    );

    const txnsArray = [txn1, txn2, txn3];
    const groupID = algosdk.computeGroupID(txnsArray);
    for (let i = 0; i < 3; i++) txnsArray[i].group = groupID;

    const myAlgoConnect = new MyAlgoConnect();
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );
    const response = await algodClient
      .sendRawTransaction(signedTxns.map((tx) => tx.blob))
      .do();

    await waitForConfirmation(algodClient, response.txId, 4);
    setResponse(response);

    console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
  } catch (err) {
    console.error(err);
  }
};

export const queryGlobalSwap = async (
  setYesToken: Function,
  setNoToken: Function,
  setPoolToken: Function,
  setYesTokenReserves: Function,
  setNoTokenReserves: Function,
  setTokenFundingReserves: Function,
  setPoolFundingReserves: Function,
  setResult: Function
) => {
  const app = await algodClient.getApplicationByID(appId).do();

  for (const [key, value] of Object.entries(
    app["params"]["global-state"] as GlobalStateIndeces
  )) {
    if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
      setYesToken(value["value"]["uint"]);
    }

    if (value["key"] == "bm9fdG9rZW5fa2V5") {
      setNoToken(value["value"]["uint"]);
    }

    if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
      setPoolToken(value["value"]["uint"]);
    }

    if (value["key"] == "eWVzX3Rva2Vuc19yZXNlcnZlcw==") {
      setYesTokenReserves(value["value"]["uint"]);
    }

    if (value["key"] == "bm9fdG9rZW5zX3Jlc2VydmVz") {
      setNoTokenReserves(value["value"]["uint"]);
    }

    if (value["key"] == "dG9rZW5fZnVuZGluZ19yZXNlcnZlcw==") {
      setTokenFundingReserves(value["value"]["uint"]);
    }

    if (value["key"] == "cG9vbF9mdW5kaW5nX3Jlc2VydmVz") {
      setPoolFundingReserves(value["value"]["uint"]);
    }

    if (value["key"] == "cmVzdWx0") {
      setResult(value["value"]["uint"]);
    }
  }
};

export const queryGlobalPool = async (
  setYesToken: Function,
  setNoToken: Function,
  setPoolToken: Function,
  setPoolTokensOutstanding: Function,
  setPoolFundingReserves: Function,
  setResult: Function
) => {
  const app = await algodClient.getApplicationByID(appId).do();

  for (const [key, value] of Object.entries(
    app["params"]["global-state"] as GlobalStateIndeces
  )) {
    if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
      setYesToken(value["value"]["uint"]);
    }
    if (value["key"] == "bm9fdG9rZW5fa2V5") {
      setNoToken(value["value"]["uint"]);
    }

    if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
      setPoolToken(value["value"]["uint"]);
    }
    if (value["key"] == "cG9vbF90b2tlbnNfb3V0c3RhbmRpbmdfa2V5") {
      setPoolTokensOutstanding(value["value"]["uint"]);
    }

    if (value["key"] == "cG9vbF9mdW5kaW5nX3Jlc2VydmVz") {
      setPoolFundingReserves(value["value"]["uint"]);
    }
    if (value["key"] == "cmVzdWx0") {
      setResult(value["value"]["uint"]);
    }
  }
};

export const queryGlobalConfig = async (
  setYesToken: Function,
  setNoToken: Function,
  setPoolToken: Function
) => {
  const app = await algodClient.getApplicationByID(appId).do();

  for (const [key, value] of Object.entries(
    app["params"]["global-state"] as GlobalStateIndeces
  )) {
    if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
      setYesToken(value["value"]["uint"]);
    }

    if (value["key"] == "bm9fdG9rZW5fa2V5") {
      setNoToken(value["value"]["uint"]);
    }

    if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
      setPoolToken(value["value"]["uint"]);
    }
  }
};

export const setupAmm = async (
  selectedAddress: string,
  setResponse: Function
) => {
  try {
    const params = await algodClient.getTransactionParams().do();

    const enc = new TextEncoder();

    const accounts = undefined;
    const foreignApps = undefined;
    const foreignAssets = [usdcId];
    const closeRemainderTo = undefined;
    const note = undefined;
    const amount = 510000;

    const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
      selectedAddress,
      contractAddress,
      amount,
      closeRemainderTo,
      note,
      params
    );

    const txn2 = algosdk.makeApplicationNoOpTxn(
      selectedAddress,
      params,
      appId,
      [enc.encode("setup")],
      accounts,
      foreignApps,
      foreignAssets
    );

    const txnsArray = [txn1, txn2];
    const groupID = algosdk.computeGroupID(txnsArray);
    for (let i = 0; i < 2; i++) txnsArray[i].group = groupID;

    const myAlgoConnect = new MyAlgoConnect();
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );
    const response = await algodClient
      .sendRawTransaction(signedTxns.map((tx) => tx.blob))
      .do();

    await waitForConfirmation(algodClient, response.txId, 4);

    setResponse(response);

    console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
  } catch (err) {
    console.error(err);
  }
};

export const OptInPool = async (
  selectedAddress: string,
  yesToken: number,
  noToken: number,
  poolToken: number,
  setResponse: Function
) => {
  try {
    const params = await algodClient.getTransactionParams().do();

    const txn1 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      amount: 0,
      from: selectedAddress,
      suggestedParams: {
        ...params,
      },
      to: selectedAddress,
      assetIndex: yesToken,
    });

    const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      amount: 0,
      from: selectedAddress,
      suggestedParams: {
        ...params,
      },
      to: selectedAddress,
      assetIndex: noToken,
    });

    const txn3 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      amount: 0,
      from: selectedAddress,
      suggestedParams: {
        ...params,
      },
      to: selectedAddress,
      assetIndex: poolToken,
    });

    const txnsArray = [txn1, txn2, txn3];
    const groupID = algosdk.computeGroupID(txnsArray);
    for (let i = 0; i < 3; i++) txnsArray[i].group = groupID;

    const myAlgoConnect = new MyAlgoConnect();
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );

    const response = await algodClient
      .sendRawTransaction(signedTxns.map((tx) => tx.blob))
      .do();

    await waitForConfirmation(algodClient, response.txId, 4);

    setResponse(response);

    console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
  } catch (err) {
    console.error(err);
  }
};

export const supplyAmm = async (
  usdcAmount: number,
  selectedAddress: string,
  yesToken: number,
  noToken: number,
  poolToken: number,
  setResponse: Function
) => {
  try {
    const params = await algodClient.getTransactionParams().do();

    const enc = new TextEncoder();

    const accounts = undefined;
    const foreignApps = undefined;
    const foreignAssets = [usdcId, noToken, yesToken, poolToken];
    const closeRemainderTo = undefined;
    const note = undefined;
    const amount = 2000;

    usdcAmount = usdcAmount * 1000000;

    const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
      selectedAddress,
      contractAddress,
      amount,
      closeRemainderTo,
      note,
      params
    );

    const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: {
        ...params,
      },
      from: selectedAddress,
      to: contractAddress,
      assetIndex: usdcId,
      amount: usdcAmount,
      note: note,
    });

    const txn3 = algosdk.makeApplicationNoOpTxn(
      selectedAddress,
      params,
      appId,
      [enc.encode("supply")],
      accounts,
      foreignApps,
      foreignAssets
    );

    const txnsArray = [txn1, txn2, txn3];
    const groupID = algosdk.computeGroupID(txnsArray);
    for (let i = 0; i < 3; i++) txnsArray[i].group = groupID;

    const myAlgoConnect = new MyAlgoConnect();
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );
    const response = await algodClient
      .sendRawTransaction(signedTxns.map((tx) => tx.blob))
      .do();

    await waitForConfirmation(algodClient, response.txId, 4);

    setResponse(response);

    console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
  } catch (err) {
    console.error(err);
  }
};

export const withdrawAmm = async (
  poolTokenAmount: number,
  selectedAddress: string,
  poolToken: number,
  setResponse: Function
) => {
  try {
    const params = await algodClient.getTransactionParams().do();

    const enc = new TextEncoder();

    const accounts = undefined;
    const foreignApps = undefined;
    const foreignAssets = [usdcId, poolToken];
    const closeRemainderTo = undefined;
    const note = undefined;
    const amount = 2000;

    poolTokenAmount = poolTokenAmount * 1000000;

    const txn1 = algosdk.makePaymentTxnWithSuggestedParams(
      selectedAddress,
      contractAddress,
      amount,
      closeRemainderTo,
      note,
      params
    );

    const txn2 = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      suggestedParams: {
        ...params,
      },
      from: selectedAddress,
      to: contractAddress,
      assetIndex: poolToken,
      amount: poolTokenAmount,
      note: note,
    });

    const txn3 = algosdk.makeApplicationNoOpTxn(
      selectedAddress,
      params,
      appId,
      [enc.encode("withdraw")],
      accounts,
      foreignApps,
      foreignAssets
    );

    const txnsArray = [txn1, txn2, txn3];
    const groupID = algosdk.computeGroupID(txnsArray);
    for (let i = 0; i < 3; i++) txnsArray[i].group = groupID;

    const myAlgoConnect = new MyAlgoConnect();
    const signedTxns = await myAlgoConnect.signTransaction(
      txnsArray.map((txn) => txn.toByte())
    );
    const response = await algodClient
      .sendRawTransaction(signedTxns.map((tx) => tx.blob))
      .do();

    await waitForConfirmation(algodClient, response.txId, 4);

    setResponse(response);
    console.log("https://testnet.algoexplorer.io/tx/" + response["txId"]);
  } catch (err) {
    console.error(err);
  }
};

import { Algodv2 } from "algosdk";

export const connectAlgod = () => {
  const algodServer = "https://testnet-algorand.api.purestake.io/ps2";
  const algodPort = "";
  const algodToken = {
    "X-API-Key": import.meta.env.VITE_API_KEY,
  };

  const algodClient = new Algodv2(algodToken, algodServer, algodPort);
  return algodClient;
};

export const waitForConfirmation = async function (
  algodClient: Algodv2,
  txId: string,
  timeout: number
) {
  if (algodClient == null || txId == null || timeout < 0) {
    throw new Error("Bad arguments");
  }

  const status = await algodClient.status().do();
  if (status === undefined) {
    throw new Error("Unable to get node status");
  }

  const startround = status["last-round"] + 1;
  let currentround = startround;

  while (currentround < startround + timeout) {
    const pendingInfo = await algodClient
      .pendingTransactionInformation(txId)
      .do();
    if (pendingInfo !== undefined) {
      if (
        pendingInfo["confirmed-round"] !== null &&
        pendingInfo["confirmed-round"] > 0
      ) {
        //Got the completed Transaction
        return pendingInfo;
      } else {
        if (
          pendingInfo["pool-error"] != null &&
          pendingInfo["pool-error"].length > 0
        ) {
          // If there was a pool error, then the transaction has been rejected!
          throw new Error(
            "Transaction " +
              txId +
              " rejected - pool error: " +
              pendingInfo["pool-error"]
          );
        }
      }
    }
    await algodClient.statusAfterBlock(currentround).do();
    currentround++;
  }

  throw new Error(
    "Transaction " + txId + " not confirmed after " + timeout + " rounds!"
  );
};

// console.log(Buffer.from(value["key"], "base64").toString());

/*   const OptIn = async () => {
    try {
      const params = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        suggestedParams: {
          ...params,
        },
        from: selectedAddress,
        to: selectedAddress,
        assetIndex: usdcId,
        amount: 0,
      });

      const myAlgoConnect = new MyAlgoConnect();
      const signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
      const response = await algodClient
        .sendRawTransaction(signedTxn.blob)
        .do();
      let transactionResponse = await algodClient
        .pendingTransactionInformation(response.txId)
        .do();

      console.log(transactionResponse);
      //console.log(response);
    } catch (err) {
      console.error(err);
    }
  };
 */

/*   const queryGlobal = async () => {
    const app = await algodClient.getApplicationByID(appId).do();
    for (const [key, value] of Object.entries(app["params"]["global-state"])) {
      if (value["key"] == "eWVzX3Rva2VuX2tleQ==") {
        //yes_token_key
        setYesToken(value["value"]["uint"]);
        console.log("Yes_token_key", value["value"]["uint"]);
      }
      if (value["key"] == "bm9fdG9rZW5fa2V5") {
        //no_token_key
        setNoToken(value["value"]["uint"]);
        console.log("No_token_key", value["value"]["uint"]);
      }
      if (value["key"] == "cG9vbF90b2tlbl9rZXk=") {
        //pool_token_key
        setPoolToken(value["value"]["uint"]);
        console.log("Pool_token_key", value["value"]["uint"]);
      }
      if (value["key"] == "eWVzX3Rva2Vuc19yZXNlcnZlcw==") {
        //yes_token_reserves
        setYesTokenReserves(value["value"]["uint"]);
        console.log("yes_token_reserves", value["value"]["uint"]);
      }
      if (value["key"] == "bm9fdG9rZW5zX3Jlc2VydmVz") {
        //no_tokens_reserves
        setNoTokenReserves(value["value"]["uint"]);
        console.log("no_token_reserves", value["value"]["uint"]);
      }
      if (value["key"] == "dG9rZW5fZnVuZGluZ19yZXNlcnZlcw==") {
        //token_funding_reserves
        console.log("token_funding_reserves", value["value"]["uint"]);
      }
      if (value["key"] == "bm9fdG9rZW5zX291dHN0YW5kaW5nX2tleQ==") {
        //no_tokens_outstanding_key
        console.log(value, value["value"]["uint"]);
      }
      if (value["key"] == "cmVzdWx0") {
        //result
        console.log(value, value["value"]["uint"]);
      }
      if (value["key"] == "Y3JlYXRvcl9rZXk=") {
        //creator_key
        console.log(value, value["value"]["uint"]);
      }
      if (value["key"] == "cG9vbF9mdW5kaW5nX3Jlc2VydmVz") {
        //pool_funding_reserves
        console.log(value["value"]["uint"]);
      }
      if (value["key"] == "cG9vbF90b2tlbnNfb3V0c3RhbmRpbmdfa2V5") {
        //pool_tokens_outstanding_key
        console.log(value["value"]["uint"]);
      }
      if (value["key"] == "dG9rZW5fZnVuZGluZ19rZXk=") {
        //token_funding_key
        console.log(value["value"]["uint"]);
      }
      if (value["key"] == "bWluX2luY3JlbWVudF9rZXk=") {
        //min_increment_key
        console.log("min_increment_key", value["value"]["uint"]);
      }
    }
  }; */

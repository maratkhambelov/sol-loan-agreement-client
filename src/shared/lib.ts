export const traceTransaction = async (transaction: () => Promise<unknown>) => {
  try {
    let txid = await transaction();
    console.log(txid);
    alert(
      `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`,
    );
    console.log(
      `Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`,
    );
  } catch (e) {
    // console.log(e);
    // console.dir(e);
    // debugger;
    console.log(JSON.stringify(e));
    alert(JSON.stringify(e));
  }
};

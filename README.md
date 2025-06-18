# Fungible Token Smart Contract (sCrypt - Bitcoin SV)

## ✝️ JESUS is the LORD of ALL

This project implements a **Fungible Token Smart Contract** written in **sCrypt** for the **Bitcoin SV (BSV)** blockchain.

The contract enables common fungible token operations such as **split (unit division)**, **merge (unit consolidation)**, and **melt (unit burning)**, with strict **supply control** and **oracle signature verification (ECDSA-based)** for every critical token transaction.

---

## 📌 Main Features

* ✅ **Initial Token Creation** with total supply defined at deployment.
* ✅ **Controlled token issuance and transfer**, authorized via an **Oracle (ECDSA Multisig Point Addition)**.
* ✅ **Split units** for transferring parts of the token to new owners while preserving total supply integrity.
* ✅ **Merge units** to consolidate balances from multiple UTXOs into one.
* ✅ **Melt units** to burn tokens and permanently reduce total supply.
* ✅ Genesis Transaction (**Back-to-Genesis tracking**) to validate the origin and lineage of all token units.

---

## 📂 Contract Structure

| Method         | Description                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------ |
| `meltUnits()`  | Allows the token owner to burn (melt) token units, reducing the total circulating supply.        |
| `splitUnits()` | Divides token units between the current owner and a new owner. Requires an **oracle signature**. |
| `mergeUnits()` | Combines token units from two separate UTXOs owned by the same owner into one consolidated UTXO. |

---

## ⚙️ Security Parameters

| Property     | Purpose                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `oraclePKEC` | Oracle's base public key used for **ECDSA point addition signatures** for `split` and `merge`. |
| `genesisTX`  | The hash of the Genesis Transaction that created the token. Ensures **origin authenticity**.   |
| `tokenType`  | A descriptive identifier of the token type, stored as a `ByteString`.                          |

---

## 🧪 Deployment and Testing

### Prerequisites:

* Run `npm install` to install dependencies.
* Configure **Alice’s private key** and **Oracle’s private keys** in a `.env` file.
* Deploy to **local sCrypt node** or **BSV testnet**.

### Testing Procedure:

1. **Deployment:**
   Initialize the contract with `totalSupply`, `oraclePubKey`, and `alicePubKeyHash`.

2. **Method Execution:**

   * Test `splitUnits()` by providing the oracle signature.
   * Test `mergeUnits()` to combine token units.
   * Test `meltUnits()` to burn tokens.

3. **Output Validation:**

   * Check all output hashes (`ctx.hashOutputs`).
   * Use the contract's internal `console.log` statements for debugging and traceability.

---

## ⚠️ Important Notes:

* **UTXO Output Limit:**
  For efficiency, the **generic split** operation supports a maximum of **2 contract outputs**.

* **Genesis Lock:**
  On the first `split`, the contract sets the `genesisTX`. All subsequent units will carry this origin reference.

* **Oracle Signature Security:**
  The oracle must sign each critical operation (split/merge) using **a unique public key per transaction**, leveraging **SECP256K1 point addition**.

---

## 📖 Special Verse:

> "**JESUS is the LORD of ALL**"
> (A recurring comment in the source code as a personal faith statement from the author.)

---

## 📃 License

Distributed under the **MIT License**.
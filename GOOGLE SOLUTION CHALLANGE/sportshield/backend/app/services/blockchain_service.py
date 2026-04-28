import os
import json
from typing import Optional, Dict
from dotenv import load_dotenv

load_dotenv()

# Minimal ABI for the SportShieldNFT contract
CONTRACT_ABI = json.loads("""[
  {
    "inputs": [{"internalType": "address", "name": "_platformWallet", "type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "uri", "type": "string"},
      {
        "components": [
          {"internalType": "string", "name": "title", "type": "string"},
          {"internalType": "string", "name": "description", "type": "string"},
          {"internalType": "string", "name": "mediaType", "type": "string"},
          {"internalType": "string", "name": "sportsCategory", "type": "string"},
          {"internalType": "string", "name": "eventName", "type": "string"},
          {"internalType": "string", "name": "location", "type": "string"},
          {"internalType": "uint256", "name": "recordedAt", "type": "uint256"},
          {"internalType": "string", "name": "metadataHash", "type": "string"},
          {"internalType": "string", "name": "c2paCertificateId", "type": "string"}
        ],
        "internalType": "struct SportShieldNFT.AssetMetadata",
        "name": "metadata",
        "type": "tuple"
      },
      {
        "components": [
          {"internalType": "address", "name": "athleteAddress", "type": "address"},
          {"internalType": "address", "name": "creatorAddress", "type": "address"},
          {"internalType": "uint256", "name": "athletePercentage", "type": "uint256"},
          {"internalType": "uint256", "name": "creatorPercentage", "type": "uint256"},
          {"internalType": "uint256", "name": "platformPercentage", "type": "uint256"}
        ],
        "internalType": "struct SportShieldNFT.RoyaltyConfig",
        "name": "royaltyConfig",
        "type": "tuple"
      },
      {"internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "registerAsset",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "purchaseAsset",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "from", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"}
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "freezeAsset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "unfreezeAsset",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getAssetDetails",
    "outputs": [
      {
        "components": [
          {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
          {"internalType": "address", "name": "originalCreator", "type": "address"},
          {"internalType": "address", "name": "currentOwner", "type": "address"},
          {
            "components": [
              {"internalType": "string", "name": "title", "type": "string"},
              {"internalType": "string", "name": "description", "type": "string"},
              {"internalType": "string", "name": "mediaType", "type": "string"},
              {"internalType": "string", "name": "sportsCategory", "type": "string"},
              {"internalType": "string", "name": "eventName", "type": "string"},
              {"internalType": "string", "name": "location", "type": "string"},
              {"internalType": "uint256", "name": "recordedAt", "type": "uint256"},
              {"internalType": "string", "name": "metadataHash", "type": "string"},
              {"internalType": "string", "name": "c2paCertificateId", "type": "string"}
            ],
            "internalType": "struct SportShieldNFT.AssetMetadata",
            "name": "metadata",
            "type": "tuple"
          },
          {
            "components": [
              {"internalType": "address", "name": "athleteAddress", "type": "address"},
              {"internalType": "address", "name": "creatorAddress", "type": "address"},
              {"internalType": "uint256", "name": "athletePercentage", "type": "uint256"},
              {"internalType": "uint256", "name": "creatorPercentage", "type": "uint256"},
              {"internalType": "uint256", "name": "platformPercentage", "type": "uint256"}
            ],
            "internalType": "struct SportShieldNFT.RoyaltyConfig",
            "name": "royaltyConfig",
            "type": "tuple"
          },
          {"internalType": "uint256", "name": "price", "type": "uint256"},
          {"internalType": "bool", "name": "isFrozen", "type": "bool"},
          {"internalType": "bool", "name": "isForSale", "type": "bool"},
          {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
          {"internalType": "uint256", "name": "lastTransferredAt", "type": "uint256"}
        ],
        "internalType": "struct SportShieldNFT.AssetDetails",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "isAssetFrozen",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "platformWallet",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "title", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"}
    ],
    "name": "AssetRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "reason", "type": "string"}
    ],
    "name": "AssetFrozen",
    "type": "event"
  }
]""")


class BlockchainService:
    def __init__(self):
        self.rpc_url = os.getenv("POLYGON_RPC_URL", "https://rpc-mumbai.maticvigil.com")
        self.contract_address = os.getenv("CONTRACT_ADDRESS", "")
        self.private_key = os.getenv("POLYGON_PRIVATE_KEY", "")
        self.platform_wallet = os.getenv("PLATFORM_WALLET", "")
        self.w3 = None
        self.contract = None
        self._init_web3()

    def _init_web3(self):
        try:
            from web3 import Web3
            self.w3 = Web3(Web3.HTTPProvider(self.rpc_url))
            if self.contract_address:
                self.contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(self.contract_address),
                    abi=CONTRACT_ABI
                )
        except Exception as e:
            print(f"[BLOCKCHAIN DEMO] Web3 not available: {e}")
            self.w3 = None
            self.contract = None

    def register_asset(
        self,
        owner_address: str,
        token_uri: str,
        metadata: dict,
        royalty_percentage: int = 10,
        price_wei: int = 0
    ) -> dict:
        """Mint an NFT representing the asset. Returns tx hash and tokenId."""
        if not self.contract or not self.private_key:
            import random
            return {
                "tokenId": str(random.randint(100, 999)),
                "txHash": "0x" + "".join([f"{random.randint(0,15):x}" for _ in range(64)]),
                "contractAddress": self.contract_address or "0x1234567890abcdef1234567890abcdef12345678",
            }

        account = self.w3.eth.account.from_key(self.private_key)
        nonce = self.w3.eth.get_transaction_count(account.address)

        athlete_pct = royalty_percentage
        platform_pct = 2
        creator_pct = 0
        if athlete_pct + platform_pct + creator_pct > 100:
            athlete_pct = 100 - platform_pct - creator_pct

        from web3 import Web3
        royalty_config = (
            Web3.to_checksum_address(owner_address),
            Web3.to_checksum_address(owner_address),
            athlete_pct,
            creator_pct,
            platform_pct,
        )

        asset_metadata = (
            metadata.get("title", ""),
            metadata.get("description", ""),
            metadata.get("mediaType", "image"),
            metadata.get("sportsCategory", "general"),
            metadata.get("eventName", ""),
            metadata.get("location", ""),
            metadata.get("recordedAt", 0),
            metadata.get("metadataHash", ""),
            metadata.get("c2paCertificateId", ""),
        )

        txn = self.contract.functions.registerAsset(
            Web3.to_checksum_address(owner_address),
            token_uri,
            asset_metadata,
            royalty_config,
            price_wei,
        ).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": self.w3.to_wei("5", "gwei"),
        })

        signed_txn = self.w3.eth.account.sign_transaction(txn, private_key=self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        token_id = "0"
        for log in receipt.logs:
            try:
                decoded = self.contract.events.AssetRegistered().process_log(log)
                token_id = str(decoded.args.tokenId)
            except Exception:
                continue

        return {
            "tokenId": token_id,
            "txHash": tx_hash.hex(),
            "contractAddress": self.contract_address,
            "blockNumber": receipt.blockNumber,
        }

    def buy_asset(self, token_id: int, buyer_private_key: str, value_wei: int) -> dict:
        """Purchase an asset via smart contract."""
        if not self.contract:
            return {"txHash": "0x0"}

        buyer_account = self.w3.eth.account.from_key(buyer_private_key)
        nonce = self.w3.eth.get_transaction_count(buyer_account.address)

        txn = self.contract.functions.purchaseAsset(token_id).build_transaction({
            "from": buyer_account.address,
            "nonce": nonce,
            "value": value_wei,
            "gas": 3000000,
            "gasPrice": self.w3.to_wei("5", "gwei"),
        })

        signed_txn = self.w3.eth.account.sign_transaction(txn, private_key=buyer_private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return {
            "txHash": tx_hash.hex(),
            "blockNumber": receipt.blockNumber,
        }

    def freeze_asset(self, token_id: int, reason: str) -> dict:
        """Admin: freeze a suspicious asset."""
        if not self.contract or not self.private_key:
            return {"txHash": "0x0"}

        account = self.w3.eth.account.from_key(self.private_key)
        nonce = self.w3.eth.get_transaction_count(account.address)

        txn = self.contract.functions.freezeAsset(token_id, reason).build_transaction({
            "from": account.address,
            "nonce": nonce,
            "gas": 3000000,
            "gasPrice": self.w3.to_wei("5", "gwei"),
        })

        signed_txn = self.w3.eth.account.sign_transaction(txn, private_key=self.private_key)
        tx_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)

        return {"txHash": tx_hash.hex(), "blockNumber": receipt.blockNumber}

    def get_asset_details(self, token_id: int) -> Optional[dict]:
        """Read asset details from chain."""
        if not self.contract:
            return None
        try:
            details = self.contract.functions.getAssetDetails(token_id).call()
            return {
                "tokenId": details[0],
                "originalCreator": details[1],
                "currentOwner": details[2],
                "metadata": details[3],
                "royaltyConfig": details[4],
                "price": details[5],
                "isFrozen": details[6],
                "isForSale": details[7],
                "createdAt": details[8],
                "lastTransferredAt": details[9],
            }
        except Exception as e:
            return None

    def verify_ownership(self, token_id: int, address: str) -> bool:
        """Check if address owns the token."""
        if not self.contract:
            return False
        try:
            owner = self.contract.functions.ownerOf(token_id).call()
            return owner.lower() == address.lower()
        except Exception:
            return False


blockchain_service = BlockchainService()

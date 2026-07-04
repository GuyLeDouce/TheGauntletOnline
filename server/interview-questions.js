const IDS = ["a", "b", "c", "d"];
const DIFFICULTY_BY_TIER = {
  1: "Easy Ugly HR",
  2: "Certified Ugly Applicant",
  3: "Deep Ugly Department",
  4: "Ugly Labs Internal",
  5: "Impossible Ugly Final"
};
const IMAGE_KEY_BY_TIER = {
  1: "tierEasy",
  2: "tierCertified",
  3: "tierDeep",
  4: "tierInternal",
  5: "tierImpossible"
};
const REWARD_BY_TIER = {
  1: 10,
  2: 40,
  3: 140,
  4: 375,
  5: 850
};
const SUPPORTED_QUESTION_LANGUAGES = ["en", "fr", "es"];

function stableIndex(value, modulo) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash % modulo;
}

function buildOptions(question) {
  const optionCount = question.wrong.length + 1;
  const correctIndex = stableIndex(question.id, optionCount);
  const orderedItems = question.wrong.map((text, wrongIndex) => ({ kind: "wrong", wrongIndex, text }));
  orderedItems.splice(correctIndex, 0, { kind: "correct", wrongIndex: null, text: question.correct });
  return {
    options: orderedItems.map((item, index) => {
      const label = {};
      for (const language of SUPPORTED_QUESTION_LANGUAGES) {
        const localized = question.i18n?.[language] || question.i18n?.en || {};
        label[language] = item.kind === "correct"
          ? localized.correct || question.correct
          : localized.wrong?.[item.wrongIndex] || question.wrong[item.wrongIndex];
      }
      return { id: IDS[index], text: label.en || item.text, label };
    }),
    correctOptionId: IDS[correctIndex]
  };
}

function localizedField(question, field) {
  const value = {};
  for (const language of SUPPORTED_QUESTION_LANGUAGES) {
    value[language] = question.i18n?.[language]?.[field] || question.i18n?.en?.[field] || question[field] || "";
  }
  return value;
}

function q(question) {
  const built = buildOptions(question);
  return {
    id: question.id,
    tier: question.tier,
    difficulty: DIFFICULTY_BY_TIER[question.tier],
    category: question.category,
    imageKey: IMAGE_KEY_BY_TIER[question.tier],
    prompt: localizedField(question, "prompt"),
    correct: question.correct,
    wrong: question.wrong,
    i18n: question.i18n,
    options: built.options,
    correctOptionId: built.correctOptionId,
    correctRoast: question.correctRoast,
    wrongRoast: question.wrongRoast,
    explanation: question.explanation,
    reward: REWARD_BY_TIER[question.tier]
  };
}

const RAW_QUESTIONS = JSON.parse(String.raw`[
  {
    "id": "squig-easy-001",
    "tier": 1,
    "category": "Web3 Basics",
    "prompt": "InSquignito squints at the chain and asks, 'What is web3, and why is everyone acting like the internet grew pockets?'",
    "correct": "Web3",
    "wrong": [
      "Pretty font"
    ],
    "correctRoast": "Correct. The internet did grow pockets. Ugly, tiny, cryptographic pockets.",
    "wrongRoast": "Wrong. A prettier font is web2 wearing a fake mustache.",
    "explanation": "Web3 usually refers to internet services that use blockchains, wallets, and tokens for ownership, identity, or access.",
    "i18n": {
      "en": {
        "prompt": "InSquignito squints at the chain and asks, 'What is web3, and why is everyone acting like the internet grew pockets?'",
        "correct": "Web3",
        "wrong": [
          "Pretty font"
        ]
      },
      "fr": {
        "prompt": "InSquignito plisse les yeux devant la chaîne et demande : 'C'est quoi le web3, et pourquoi Internet a soudain des poches ?'",
        "correct": "Web3",
        "wrong": [
          "Fonte jolie"
        ]
      },
      "es": {
        "prompt": "InSquignito entrecierra los ojos ante la cadena y pregunta: '¿Qué es web3, y por qué Internet de pronto tiene bolsillos?'",
        "correct": "Web3",
        "wrong": [
          "Fuente bonita"
        ]
      }
    }
  },
  {
    "id": "squig-easy-002",
    "tier": 1,
    "category": "Blockchain",
    "prompt": "InSquignito asks, 'What is a blockchain, besides a very dramatic spreadsheet with fans?'",
    "correct": "Public ledger",
    "wrong": [
      "Private notebook"
    ],
    "correctRoast": "Correct. A spreadsheet with witnesses. Ugly Labs respects the witnesses.",
    "wrongRoast": "Wrong. One private notebook is just an office secret with extra steps.",
    "explanation": "A blockchain is a distributed ledger: many computers verify and keep the same record.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a blockchain, besides a very dramatic spreadsheet with fans?'",
        "correct": "Public ledger",
        "wrong": [
          "Private notebook"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi une blockchain, à part un tableur dramatique avec des fans ?'",
        "correct": "Registre public",
        "wrong": [
          "Carnet privé"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es una blockchain, además de una hoja dramática con fans?'",
        "correct": "Libro público",
        "wrong": [
          "Cuaderno privado"
        ]
      }
    }
  },
  {
    "id": "squig-easy-003",
    "tier": 1,
    "category": "Wallets",
    "prompt": "InSquignito opens an empty drawer and asks, 'Is this my crypto wallet?'",
    "correct": "Wallet",
    "wrong": [
      "Drawer"
    ],
    "correctRoast": "Correct. The drawer has vibes, but no private keys.",
    "wrongRoast": "Wrong. Whispering Ethereum at furniture remains unsupported.",
    "explanation": "Wallets do not literally store coins like a pocket; they manage keys that control assets on a blockchain.",
    "i18n": {
      "en": {
        "prompt": "InSquignito opens an empty drawer and asks, 'Is this my crypto wallet?'",
        "correct": "Wallet",
        "wrong": [
          "Drawer"
        ]
      },
      "fr": {
        "prompt": "InSquignito ouvre un tiroir vide et demande : 'C'est mon wallet crypto ?'",
        "correct": "Wallet",
        "wrong": [
          "Tiroir"
        ]
      },
      "es": {
        "prompt": "InSquignito abre un cajón vacío y pregunta: '¿Este es mi wallet cripto?'",
        "correct": "Wallet",
        "wrong": [
          "Cajón"
        ]
      }
    }
  },
  {
    "id": "squig-easy-004",
    "tier": 1,
    "category": "Private Keys",
    "prompt": "InSquignito finds a secret phrase and asks, 'Should I show this to a marketplace goblin for friendship?'",
    "correct": "Seed phrase",
    "wrong": [
      "Share it"
    ],
    "correctRoast": "Correct. The seed phrase stays in the basement vault with the suspicious chair.",
    "wrongRoast": "Wrong. That goblin now owns the chair, the vault, and probably the snacks.",
    "explanation": "Anyone with a seed phrase or private key can often move the wallet's assets, so it should never be shared.",
    "i18n": {
      "en": {
        "prompt": "InSquignito finds a secret phrase and asks, 'Should I show this to a marketplace goblin for friendship?'",
        "correct": "Seed phrase",
        "wrong": [
          "Share it"
        ]
      },
      "fr": {
        "prompt": "InSquignito trouve une phrase secrète et demande : 'Je la montre à un gobelin de marketplace pour devenir amis ?'",
        "correct": "Phrase seed",
        "wrong": [
          "Partager"
        ]
      },
      "es": {
        "prompt": "InSquignito encuentra una frase secreta y pregunta: '¿Se la enseño a un duende de marketplace para hacer amistad?'",
        "correct": "Frase semilla",
        "wrong": [
          "Compartirla"
        ]
      }
    }
  },
  {
    "id": "squig-easy-005",
    "tier": 1,
    "category": "Public Address",
    "prompt": "InSquignito asks, 'Can I show my public wallet address, or will the chain sneeze?'",
    "correct": "Public address",
    "wrong": [
      "Seed leak"
    ],
    "correctRoast": "Correct. Public address: mailbox. Seed phrase: forbidden basement map.",
    "wrongRoast": "Wrong. The address is public; the danger goblin lives in the private keys.",
    "explanation": "A public address is meant to be shared, while private keys and seed phrases must stay secret.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Can I show my public wallet address, or will the chain sneeze?'",
        "correct": "Public address",
        "wrong": [
          "Seed leak"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Je peux montrer mon adresse publique, ou la chaîne va éternuer ?'",
        "correct": "Adresse publique",
        "wrong": [
          "Fuite seed"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Puedo mostrar mi dirección pública, o la cadena estornuda?'",
        "correct": "Dirección pública",
        "wrong": [
          "Fuga semilla"
        ]
      }
    }
  },
  {
    "id": "squig-easy-006",
    "tier": 1,
    "category": "Crypto",
    "prompt": "InSquignito asks, 'What is crypto supposed to be in this ugly onboarding ritual?'",
    "correct": "Digital assets",
    "wrong": [
      "Treasure soup"
    ],
    "correctRoast": "Correct. Useful, risky, volatile, and deeply weird. Approved.",
    "wrongRoast": "Wrong. Guaranteed treasure soup is how the pretty scammers season the trap.",
    "explanation": "Crypto assets can have different uses and risks; they are not guaranteed to increase in value.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is crypto supposed to be in this ugly onboarding ritual?'",
        "correct": "Digital assets",
        "wrong": [
          "Treasure soup"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'La crypto, c'est censé être quoi dans ce rituel d'onboarding laid ?'",
        "correct": "Actifs numériques",
        "wrong": [
          "Soupe trésor"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué se supone que es la cripto en este ritual feo de onboarding?'",
        "correct": "Activos digitales",
        "wrong": [
          "Sopa tesoro"
        ]
      }
    }
  },
  {
    "id": "squig-easy-007",
    "tier": 1,
    "category": "Ethereum",
    "prompt": "InSquignito points at ETH and asks, 'Why does this coin keep standing near the Squigs door?'",
    "correct": "ETH",
    "wrong": [
      "Gas coupon"
    ],
    "correctRoast": "Correct. ETH pays the toll troll. The toll troll is not cute.",
    "wrongRoast": "Wrong. The toll troll heard coupon and became more expensive.",
    "explanation": "On Ethereum, ETH is used to pay network fees and often to buy NFTs listed in ETH.",
    "i18n": {
      "en": {
        "prompt": "InSquignito points at ETH and asks, 'Why does this coin keep standing near the Squigs door?'",
        "correct": "ETH",
        "wrong": [
          "Gas coupon"
        ]
      },
      "fr": {
        "prompt": "InSquignito pointe l'ETH et demande : 'Pourquoi cette pièce traîne près de la porte des Squigs ?'",
        "correct": "ETH",
        "wrong": [
          "Coupon gas"
        ]
      },
      "es": {
        "prompt": "InSquignito señala ETH y pregunta: '¿Por qué esta moneda se queda junto a la puerta de los Squigs?'",
        "correct": "ETH",
        "wrong": [
          "Cupón gas"
        ]
      }
    }
  },
  {
    "id": "squig-easy-008",
    "tier": 1,
    "category": "Gas Fees",
    "prompt": "InSquignito asks, 'What is gas? Did the blockchain eat beans?'",
    "correct": "Gas fees",
    "wrong": [
      "Smell trait"
    ],
    "correctRoast": "Correct. Fee fumes. Horrible name. Functional concept.",
    "wrongRoast": "Wrong. A smell trait would be ugly, but the chain wants fees, not perfume.",
    "explanation": "Blockchain transactions require fees, commonly called gas on Ethereum, to pay for computation and validation.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is gas? Did the blockchain eat beans?'",
        "correct": "Gas fees",
        "wrong": [
          "Smell trait"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi le gas ? La blockchain a mangé des haricots ?'",
        "correct": "Frais gas",
        "wrong": [
          "Trait odeur"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es el gas? ¿La blockchain comió frijoles?'",
        "correct": "Tarifa gas",
        "wrong": [
          "Rasgo olor"
        ]
      }
    }
  },
  {
    "id": "squig-easy-009",
    "tier": 1,
    "category": "NFTs",
    "prompt": "InSquignito asks, 'What is an NFT, and can it be my Squig friend certificate?'",
    "correct": "Unique token",
    "wrong": [
      "Crown screenshot"
    ],
    "correctRoast": "Correct. The token is the receipt goblin. The image is only part of the mess.",
    "wrongRoast": "Wrong. Screenshots can look, but they cannot prove token ownership.",
    "explanation": "NFT ownership is tracked by a token on-chain; media and metadata are associated with that token.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is an NFT, and can it be my Squig friend certificate?'",
        "correct": "Unique token",
        "wrong": [
          "Crown screenshot"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi un NFT, et ça peut être mon certificat d'ami Squig ?'",
        "correct": "Jeton unique",
        "wrong": [
          "Capture royale"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es un NFT, y puede ser mi certificado de amigo Squig?'",
        "correct": "Token único",
        "wrong": [
          "Captura real"
        ]
      }
    }
  },
  {
    "id": "squig-easy-010",
    "tier": 1,
    "category": "Collections",
    "prompt": "InSquignito asks, 'What is an NFT collection?'",
    "correct": "NFT collection",
    "wrong": [
      "Couch pile"
    ],
    "correctRoast": "Correct. A family of ugly little tokens, not couch lint.",
    "wrongRoast": "Wrong. Couch-lint images are not a collection unless the contract says so.",
    "explanation": "Collections usually group related tokens, often with a shared smart contract and theme.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is an NFT collection?'",
        "correct": "NFT collection",
        "wrong": [
          "Couch pile"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi une collection NFT ?'",
        "correct": "Collection NFT",
        "wrong": [
          "Tas canapé"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es una colección NFT?'",
        "correct": "Colección NFT",
        "wrong": [
          "Montón sofá"
        ]
      }
    }
  },
  {
    "id": "squig-easy-011",
    "tier": 1,
    "category": "Marketplaces",
    "prompt": "InSquignito asks, 'Where do humans usually browse NFTs for sale without licking the contract directly?'",
    "correct": "Marketplace",
    "wrong": [
      "Panic sheet"
    ],
    "correctRoast": "Correct. Marketplaces are the shop windows. Still check the address behind the glass.",
    "wrongRoast": "Wrong. Spreadsheets can be useful, but this one smells like panic.",
    "explanation": "NFT marketplaces provide interfaces for browsing and trading NFTs, but buyers still need to verify what they are buying.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Where do humans usually browse NFTs for sale without licking the contract directly?'",
        "correct": "Marketplace",
        "wrong": [
          "Panic sheet"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Où les humains regardent des NFT à vendre sans lécher le contrat directement ?'",
        "correct": "Marketplace",
        "wrong": [
          "Tableur panique"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Dónde miran los humanos NFT en venta sin lamer el contrato directamente?'",
        "correct": "Marketplace",
        "wrong": [
          "Hoja pánico"
        ]
      }
    }
  },
  {
    "id": "squig-easy-012",
    "tier": 1,
    "category": "Exchanges",
    "prompt": "InSquignito asks, 'What is a crypto exchange in beginner words?'",
    "correct": "Exchange",
    "wrong": [
      "Hat swap"
    ],
    "correctRoast": "Correct. Money goes in, crypto may come out, paperwork lurks nearby.",
    "wrongRoast": "Wrong. Hat swaps are culture. Exchanges are custody and trading rails.",
    "explanation": "Centralized exchanges often let users buy crypto with fiat currency, but they may hold assets for the user until withdrawal.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a crypto exchange in beginner words?'",
        "correct": "Exchange",
        "wrong": [
          "Hat swap"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi un exchange crypto, en mots de débutant ?'",
        "correct": "Exchange",
        "wrong": [
          "Échange chapeaux"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es un exchange cripto, en palabras de principiante?'",
        "correct": "Exchange",
        "wrong": [
          "Cambio sombreros"
        ]
      }
    }
  },
  {
    "id": "squig-easy-013",
    "tier": 1,
    "category": "Fiat Onboarding",
    "prompt": "InSquignito asks, 'What does fiat mean? Is it a tiny car for ETH?'",
    "correct": "Fiat money",
    "wrong": [
      "Free gas"
    ],
    "correctRoast": "Correct. Dollars, euros, regular money. The tiny car may leave.",
    "wrongRoast": "Wrong. No spell has made gas free. Ugly Labs checked twice.",
    "explanation": "Fiat refers to traditional government currency, which many exchanges accept for buying crypto.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What does fiat mean? Is it a tiny car for ETH?'",
        "correct": "Fiat money",
        "wrong": [
          "Free gas"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Fiat, ça veut dire quoi ? Une petite voiture pour ETH ?'",
        "correct": "Monnaie fiat",
        "wrong": [
          "Gas gratuit"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué significa fiat? ¿Un cochecito para ETH?'",
        "correct": "Dinero fiat",
        "wrong": [
          "Gas gratis"
        ]
      }
    }
  },
  {
    "id": "squig-easy-014",
    "tier": 1,
    "category": "Self Custody",
    "prompt": "InSquignito asks, 'What does self-custody mean, and why does it sound like homework?'",
    "correct": "Self-custody",
    "wrong": [
      "Forever promise"
    ],
    "correctRoast": "Correct. Freedom plus responsibility. The ugliest combo platter.",
    "wrongRoast": "Wrong. Forever promises age like unrefrigerated soup.",
    "explanation": "Self-custody gives the holder control, but losing keys can mean losing access.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What does self-custody mean, and why does it sound like homework?'",
        "correct": "Self-custody",
        "wrong": [
          "Forever promise"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'L'auto-garde, c'est quoi, et pourquoi ça sent les devoirs ?'",
        "correct": "Auto-garde",
        "wrong": [
          "Promesse éternelle"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es la autocustodia, y por qué suena a tarea?'",
        "correct": "Autocustodia",
        "wrong": [
          "Promesa eterna"
        ]
      }
    }
  },
  {
    "id": "squig-easy-015",
    "tier": 1,
    "category": "Custodial Accounts",
    "prompt": "InSquignito asks, 'If my crypto stays on an exchange, who usually controls the keys?'",
    "correct": "Exchange keys",
    "wrong": [
      "Cereal box"
    ],
    "correctRoast": "Correct. Not your keys, not your full control. The cereal box is decorative.",
    "wrongRoast": "Wrong. The cereal box failed compliance and snack security.",
    "explanation": "In custodial exchange accounts, the platform controls private keys and credits the user internally.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If my crypto stays on an exchange, who usually controls the keys?'",
        "correct": "Exchange keys",
        "wrong": [
          "Cereal box"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si ma crypto reste sur un exchange, qui contrôle normalement les clés ?'",
        "correct": "Clés exchange",
        "wrong": [
          "Boîte céréales"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si mi cripto queda en un exchange, ¿quién suele controlar las llaves?'",
        "correct": "Llaves exchange",
        "wrong": [
          "Caja cereal"
        ]
      }
    }
  },
  {
    "id": "squig-easy-016",
    "tier": 1,
    "category": "Transactions",
    "prompt": "InSquignito asks, 'What is a transaction on-chain?'",
    "correct": "Transaction",
    "wrong": [
      "Discord rumor"
    ],
    "correctRoast": "Correct. The chain records actions, not vibes shouted into the goblin hall.",
    "wrongRoast": "Wrong. Discord rumors create panic, not settlement.",
    "explanation": "Blockchain transactions are signed and submitted actions that can change balances or permissions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a transaction on-chain?'",
        "correct": "Transaction",
        "wrong": [
          "Discord rumor"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi une transaction on-chain ?'",
        "correct": "Transaction",
        "wrong": [
          "Rumeur Discord"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es una transacción on-chain?'",
        "correct": "Transacción",
        "wrong": [
          "Rumor Discord"
        ]
      }
    }
  },
  {
    "id": "squig-easy-017",
    "tier": 1,
    "category": "Signatures",
    "prompt": "InSquignito asks, 'When a wallet asks me to sign, is it always safe because the button is shiny?'",
    "correct": "Read signature",
    "wrong": [
      "Shiny safe"
    ],
    "correctRoast": "Correct. The shiny button has been placed under suspicion.",
    "wrongRoast": "Wrong. Shiny buttons are how traps moisturize.",
    "explanation": "Wallet signatures can be harmless logins or powerful approvals, so users should review them carefully.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'When a wallet asks me to sign, is it always safe because the button is shiny?'",
        "correct": "Read signature",
        "wrong": [
          "Shiny safe"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quand un wallet me demande de signer, c'est toujours sûr parce que le bouton brille ?'",
        "correct": "Lire signature",
        "wrong": [
          "Bouton brillant"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Cuando un wallet me pide firmar, ¿siempre es seguro porque el botón brilla?'",
        "correct": "Leer firma",
        "wrong": [
          "Botón brillante"
        ]
      }
    }
  },
  {
    "id": "squig-easy-018",
    "tier": 1,
    "category": "Networks",
    "prompt": "InSquignito asks, 'Why does everyone keep saying mainnet? Is there a side quest net?'",
    "correct": "Mainnet",
    "wrong": [
      "Squig ranking"
    ],
    "correctRoast": "Correct. Mainnet is the real road. Testnets are practice parking lots.",
    "wrongRoast": "Wrong. Friendship rankings remain off-chain and emotionally unstable.",
    "explanation": "Mainnets handle real value; testnets are usually for testing without real funds.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why does everyone keep saying mainnet? Is there a side quest net?'",
        "correct": "Mainnet",
        "wrong": [
          "Squig ranking"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi tout le monde dit mainnet ? Il y a un filet de quête secondaire ?'",
        "correct": "Mainnet",
        "wrong": [
          "Classement Squig"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué todos dicen mainnet? ¿Hay una red de misión secundaria?'",
        "correct": "Mainnet",
        "wrong": [
          "Ranking Squig"
        ]
      }
    }
  },
  {
    "id": "squig-easy-019",
    "tier": 1,
    "category": "NFT Ownership",
    "prompt": "InSquignito asks, 'If I buy a Squig NFT, what does my wallet actually hold?'",
    "correct": "Token ownership",
    "wrong": [
      "Image laundry"
    ],
    "correctRoast": "Correct. Token ownership, not a laundry-stuffed internet.",
    "wrongRoast": "Wrong. Wallets do not swallow images. They already have enough anxiety.",
    "explanation": "A wallet owns tokens on-chain; images and metadata are referenced separately.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If I buy a Squig NFT, what does my wallet actually hold?'",
        "correct": "Token ownership",
        "wrong": [
          "Image laundry"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si j'achète un NFT Squig, mon wallet détient quoi exactement ?'",
        "correct": "Propriété token",
        "wrong": [
          "Lessive image"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si compro un NFT Squig, ¿qué tiene mi wallet exactamente?'",
        "correct": "Propiedad token",
        "wrong": [
          "Lavado imagen"
        ]
      }
    }
  },
  {
    "id": "squig-easy-020",
    "tier": 1,
    "category": "Beginner Summary",
    "prompt": "InSquignito asks, 'What is the first ugly rule before I chase Squig friends?'",
    "correct": "Learn first",
    "wrong": [
      "Click fast"
    ],
    "correctRoast": "Correct. Slow ugly learning beats fast pretty panic.",
    "wrongRoast": "Wrong. The fastest button is usually bait with good lighting.",
    "explanation": "A beginner should understand the basics and risks before making NFT purchases.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is the first ugly rule before I chase Squig friends?'",
        "correct": "Learn first",
        "wrong": [
          "Click fast"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quelle est la première règle laide avant de courir après des amis Squigs ?'",
        "correct": "Apprendre d'abord",
        "wrong": [
          "Cliquer vite"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cuál es la primera regla fea antes de perseguir amigos Squig?'",
        "correct": "Aprender primero",
        "wrong": [
          "Clic rápido"
        ]
      }
    }
  },
  {
    "id": "squig-certified-001",
    "tier": 2,
    "category": "Exchange Accounts",
    "prompt": "InSquignito asks, 'Why might a new human use an exchange before buying a Squig?'",
    "correct": "On-ramp",
    "wrong": [
      "Mint password",
      "Freeze prices"
    ],
    "correctRoast": "Correct. The exchange is the fiat-to-crypto mudslide entrance.",
    "wrongRoast": "Wrong. Exchanges do many things, but they do not domesticate prices.",
    "explanation": "Many beginners use centralized exchanges as an on-ramp from fiat currency into crypto.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why might a new human use an exchange before buying a Squig?'",
        "correct": "On-ramp",
        "wrong": [
          "Mint password",
          "Freeze prices"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi un nouvel humain utiliserait un exchange avant d'acheter un Squig ?'",
        "correct": "Rampe entrée",
        "wrong": [
          "Minter passe",
          "Prix figés"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué un humano nuevo usaría un exchange antes de comprar un Squig?'",
        "correct": "Rampa entrada",
        "wrong": [
          "Mint contraseña",
          "Precios fijos"
        ]
      }
    }
  },
  {
    "id": "squig-certified-002",
    "tier": 2,
    "category": "KYC",
    "prompt": "InSquignito asks, 'Why does an exchange ask for identity checks before letting me buy crypto?'",
    "correct": "Compliance",
    "wrong": [
      "Hair rating",
      "Selfie chain"
    ],
    "correctRoast": "Correct. Compliance goblins require paperwork.",
    "wrongRoast": "Wrong. The hairstyle rating is internal Ugly Labs business only.",
    "explanation": "Centralized exchanges often require Know Your Customer checks before allowing deposits, purchases, or withdrawals.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why does an exchange ask for identity checks before letting me buy crypto?'",
        "correct": "Compliance",
        "wrong": [
          "Hair rating",
          "Selfie chain"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi un exchange demande mon identité avant de me laisser acheter de la crypto ?'",
        "correct": "Conformité",
        "wrong": [
          "Note coiffure",
          "Selfie chaîne"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué un exchange pide identidad antes de dejarme comprar cripto?'",
        "correct": "Cumplimiento",
        "wrong": [
          "Peinado nota",
          "Selfie cadena"
        ]
      }
    }
  },
  {
    "id": "squig-certified-003",
    "tier": 2,
    "category": "Deposits",
    "prompt": "InSquignito asks, 'If I deposit fiat to an exchange, what should I check before buying ETH?'",
    "correct": "Fees limits",
    "wrong": [
      "Moon mood",
      "Lobby slime"
    ],
    "correctRoast": "Correct. Fees and limits first, moon poetry later.",
    "wrongRoast": "Wrong. Button color is not a risk model, even when ugly.",
    "explanation": "Exchange fees, holds, limits, and withdrawal rules can affect how quickly and cheaply a user can move funds.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If I deposit fiat to an exchange, what should I check before buying ETH?'",
        "correct": "Fees limits",
        "wrong": [
          "Moon mood",
          "Lobby slime"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si je dépose du fiat sur un exchange, que vérifier avant d'acheter ETH ?'",
        "correct": "Frais limites",
        "wrong": [
          "Humeur lune",
          "Slime hall"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si deposito fiat en un exchange, ¿qué reviso antes de comprar ETH?'",
        "correct": "Tarifas límites",
        "wrong": [
          "Humor luna",
          "Slime lobby"
        ]
      }
    }
  },
  {
    "id": "squig-certified-004",
    "tier": 2,
    "category": "Buying ETH",
    "prompt": "InSquignito asks, 'Why would I buy ETH before shopping for Ethereum NFTs?'",
    "correct": "Buy ETH",
    "wrong": [
      "Free mint",
      "Skip verify"
    ],
    "correctRoast": "Correct. ETH is the toll coin and often the price coin.",
    "wrongRoast": "Wrong. ETH cannot protect you from a fake collection with a pretty smile.",
    "explanation": "Ethereum NFT purchases commonly require ETH for payment and transaction fees.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why would I buy ETH before shopping for Ethereum NFTs?'",
        "correct": "Buy ETH",
        "wrong": [
          "Free mint",
          "Skip verify"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi acheter ETH avant de faire les boutiques de NFT Ethereum ?'",
        "correct": "Acheter ETH",
        "wrong": [
          "Mint gratuit",
          "Saut vérif"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué comprar ETH antes de buscar NFT de Ethereum?'",
        "correct": "Comprar ETH",
        "wrong": [
          "Mint gratis",
          "Saltar verificación"
        ]
      }
    }
  },
  {
    "id": "squig-certified-005",
    "tier": 2,
    "category": "Withdrawals",
    "prompt": "InSquignito asks, 'I bought ETH on an exchange. What is the careful next step if I want it in my wallet?'",
    "correct": "Careful withdrawal",
    "wrong": [
      "Confident address",
      "Seed search"
    ],
    "correctRoast": "Correct. Address, network, amount. Then breathe through the ugly.",
    "wrongRoast": "Wrong. Emotional confidence is not checksumming.",
    "explanation": "Crypto transfers are hard to reverse, so the address and network must be checked carefully before withdrawal.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'I bought ETH on an exchange. What is the careful next step if I want it in my wallet?'",
        "correct": "Careful withdrawal",
        "wrong": [
          "Confident address",
          "Seed search"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'J'ai acheté ETH sur un exchange. Quelle étape prudente si je le veux dans mon wallet ?'",
        "correct": "Retrait prudent",
        "wrong": [
          "Adresse confiante",
          "Recherche seed"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Compré ETH en un exchange. ¿Cuál es el paso cuidadoso para llevarlo a mi wallet?'",
        "correct": "Retiro cuidadoso",
        "wrong": [
          "Dirección confiada",
          "Búsqueda semilla"
        ]
      }
    }
  },
  {
    "id": "squig-certified-006",
    "tier": 2,
    "category": "Network Choice",
    "prompt": "InSquignito asks, 'Why is the withdrawal network choice so dangerous-looking?'",
    "correct": "Wrong network",
    "wrong": [
      "Apology refund",
      "Same chain"
    ],
    "correctRoast": "Correct. Same-looking hallways can lead to different basements.",
    "wrongRoast": "Wrong. The apology refund goblin is fictional and underfunded.",
    "explanation": "Different networks are separate systems; assets sent to an unsupported network may not appear where expected.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why is the withdrawal network choice so dangerous-looking?'",
        "correct": "Wrong network",
        "wrong": [
          "Apology refund",
          "Same chain"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi le choix du réseau de retrait a l'air si dangereux ?'",
        "correct": "Mauvais réseau",
        "wrong": [
          "Remboursement pardon",
          "Même chaîne"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué elegir la red de retiro se ve tan peligroso?'",
        "correct": "Red incorrecta",
        "wrong": [
          "Reembolso perdón",
          "Misma cadena"
        ]
      }
    }
  },
  {
    "id": "squig-certified-007",
    "tier": 2,
    "category": "Test Transfers",
    "prompt": "InSquignito asks, 'Why do cautious humans sometimes send a small test transfer first?'",
    "correct": "Test transfer",
    "wrong": [
      "Train ETH",
      "Wallet appetizer"
    ],
    "correctRoast": "Correct. Tiny test goblin goes first into the fog.",
    "wrongRoast": "Wrong. Wallet appetizers are a beautiful lie.",
    "explanation": "A small test transfer can reduce risk before sending a larger amount, though it may add extra fees.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do cautious humans sometimes send a small test transfer first?'",
        "correct": "Test transfer",
        "wrong": [
          "Train ETH",
          "Wallet appetizer"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi les humains prudents envoient parfois un petit test d'abord ?'",
        "correct": "Test transfert",
        "wrong": [
          "Dresser ETH",
          "Apéro wallet"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué los humanos cautos a veces hacen una transferencia pequeña primero?'",
        "correct": "Transferencia prueba",
        "wrong": [
          "Entrenar ETH",
          "Aperitivo wallet"
        ]
      }
    }
  },
  {
    "id": "squig-certified-008",
    "tier": 2,
    "category": "Wallet Connection",
    "prompt": "InSquignito asks, 'What does connecting my wallet to a site usually do first?'",
    "correct": "Public address",
    "wrong": [
      "Instant ownership",
      "Upload seed"
    ],
    "correctRoast": "Correct. Connection is a handshake. Signing is where the weird paperwork begins.",
    "wrongRoast": "Wrong. If connecting alone gave away everything, the internet would be soup.",
    "explanation": "Connecting a wallet typically shares a public address; transactions or approvals require separate user confirmation.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What does connecting my wallet to a site usually do first?'",
        "correct": "Public address",
        "wrong": [
          "Instant ownership",
          "Upload seed"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Connecter mon wallet à un site fait quoi au départ ?'",
        "correct": "Adresse publique",
        "wrong": [
          "Propriété instant",
          "Upload seed"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué hace primero conectar mi wallet a un sitio?'",
        "correct": "Dirección pública",
        "wrong": [
          "Propiedad instant",
          "Subir semilla"
        ]
      }
    }
  },
  {
    "id": "squig-certified-009",
    "tier": 2,
    "category": "Read The Prompt",
    "prompt": "InSquignito asks, 'A wallet popup appears. What should my tiny ugly eyes inspect?'",
    "correct": "Read popup",
    "wrong": [
      "Friendly button",
      "Desk aesthetic"
    ],
    "correctRoast": "Correct. Read the paperwork before the paperwork reads you.",
    "wrongRoast": "Wrong. Friendly buttons have betrayed entire snack drawers.",
    "explanation": "Wallet prompts can request different permissions or transactions, so users should review details before approving.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A wallet popup appears. What should my tiny ugly eyes inspect?'",
        "correct": "Read popup",
        "wrong": [
          "Friendly button",
          "Desk aesthetic"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Une fenêtre wallet apparaît. Que doivent inspecter mes petits yeux laids ?'",
        "correct": "Lire popup",
        "wrong": [
          "Bouton sympa",
          "Style bureau"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Aparece un popup del wallet. ¿Qué deben inspeccionar mis ojitos feos?'",
        "correct": "Leer popup",
        "wrong": [
          "Botón amable",
          "Estética escritorio"
        ]
      }
    }
  },
  {
    "id": "squig-certified-010",
    "tier": 2,
    "category": "Custody Choice",
    "prompt": "InSquignito asks, 'What is the tradeoff between exchange custody and self-custody?'",
    "correct": "Tradeoff",
    "wrong": [
      "Zero risk",
      "Support recovery"
    ],
    "correctRoast": "Correct. Convenience on one side, key responsibility on the other.",
    "wrongRoast": "Wrong. Zero risk is a pretty phrase wearing clown shoes.",
    "explanation": "Custodial services and self-custody have different risks, responsibilities, and recovery options.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is the tradeoff between exchange custody and self-custody?'",
        "correct": "Tradeoff",
        "wrong": [
          "Zero risk",
          "Support recovery"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quel est le compromis entre garde par exchange et auto-garde ?'",
        "correct": "Compromis",
        "wrong": [
          "Risque zéro",
          "Support récup"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cuál es el equilibrio entre custodia del exchange y autocustodia?'",
        "correct": "Equilibrio",
        "wrong": [
          "Riesgo cero",
          "Soporte recupera"
        ]
      }
    }
  },
  {
    "id": "squig-certified-011",
    "tier": 2,
    "category": "Stablecoins",
    "prompt": "InSquignito asks, 'What is a stablecoin supposed to do?'",
    "correct": "Stablecoin",
    "wrong": [
      "Polite NFT",
      "Calm gas"
    ],
    "correctRoast": "Correct. Supposed to track value. Still read the fine slime.",
    "wrongRoast": "Wrong. Gas fees do not attend therapy.",
    "explanation": "Stablecoins are designed to maintain a peg, but they still carry issuer, smart contract, and market risks.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a stablecoin supposed to do?'",
        "correct": "Stablecoin",
        "wrong": [
          "Polite NFT",
          "Calm gas"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un stablecoin est censé faire quoi ?'",
        "correct": "Stablecoin",
        "wrong": [
          "NFT poli",
          "Gas calme"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué se supone que hace una stablecoin?'",
        "correct": "Stablecoin",
        "wrong": [
          "NFT educado",
          "Gas calmado"
        ]
      }
    }
  },
  {
    "id": "squig-certified-012",
    "tier": 2,
    "category": "Volatility",
    "prompt": "InSquignito asks, 'Why should I not treat crypto prices like a calm pond?'",
    "correct": "Volatility",
    "wrong": [
      "Pond ban",
      "Blink prices"
    ],
    "correctRoast": "Correct. Volatility is the pond monster under the lily pad.",
    "wrongRoast": "Wrong. InSquignito blinked. The chart did not apologize.",
    "explanation": "Crypto and NFTs can be highly volatile, so purchases should be approached carefully.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why should I not treat crypto prices like a calm pond?'",
        "correct": "Volatility",
        "wrong": [
          "Pond ban",
          "Blink prices"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi ne pas traiter les prix crypto comme un étang calme ?'",
        "correct": "Volatilité",
        "wrong": [
          "Étang interdit",
          "Prix clignés"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué no tratar los precios cripto como un estanque tranquilo?'",
        "correct": "Volatilidad",
        "wrong": [
          "Estanque prohibido",
          "Precios parpadeo"
        ]
      }
    }
  },
  {
    "id": "squig-certified-013",
    "tier": 2,
    "category": "Exchange Fees",
    "prompt": "InSquignito asks, 'Why did my exchange total look smaller after buying or withdrawing?'",
    "correct": "Fees spreads",
    "wrong": [
      "Snack tax",
      "Bored chain"
    ],
    "correctRoast": "Correct. Fees and spreads: the small bites in the sandwich.",
    "wrongRoast": "Wrong. Squigs prefer official snack paperwork.",
    "explanation": "Exchanges may charge trading fees, include spreads, or deduct withdrawal fees.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why did my exchange total look smaller after buying or withdrawing?'",
        "correct": "Fees spreads",
        "wrong": [
          "Snack tax",
          "Bored chain"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi mon total exchange est plus petit après achat ou retrait ?'",
        "correct": "Frais spreads",
        "wrong": [
          "Taxe snacks",
          "Chaîne blasée"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué mi total del exchange quedó menor tras comprar o retirar?'",
        "correct": "Tarifas spreads",
        "wrong": [
          "Impuesto snacks",
          "Cadena aburrida"
        ]
      }
    }
  },
  {
    "id": "squig-certified-014",
    "tier": 2,
    "category": "Address Format",
    "prompt": "InSquignito asks, 'What does an Ethereum address usually look like?'",
    "correct": "0x address",
    "wrong": [
      "Cute nickname",
      "Whisper password"
    ],
    "correctRoast": "Correct. Long 0x noodle. Public, but still verify it.",
    "wrongRoast": "Wrong. Nicknames can exist through naming services, but raw addresses are not passwords.",
    "explanation": "Ethereum addresses are public identifiers, commonly shown as hexadecimal strings beginning with 0x.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What does an Ethereum address usually look like?'",
        "correct": "0x address",
        "wrong": [
          "Cute nickname",
          "Whisper password"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'À quoi ressemble généralement une adresse Ethereum ?'",
        "correct": "Adresse 0x",
        "wrong": [
          "Surnom mignon",
          "Mot chuchoté"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cómo suele verse una dirección de Ethereum?'",
        "correct": "Dirección 0x",
        "wrong": [
          "Apodo lindo",
          "Clave susurrada"
        ]
      }
    }
  },
  {
    "id": "squig-certified-015",
    "tier": 2,
    "category": "ENS And Names",
    "prompt": "InSquignito asks, 'If a wallet uses a name instead of a long address, what should I do?'",
    "correct": "Verify name",
    "wrong": [
      "Cute name",
      "Extra ETH"
    ],
    "correctRoast": "Correct. Names are helpful. Verification is uglier and better.",
    "wrongRoast": "Wrong. Cute names are how mistakes put on perfume.",
    "explanation": "Human-readable names can map to addresses, but users should confirm the resolved address before sending assets.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If a wallet uses a name instead of a long address, what should I do?'",
        "correct": "Verify name",
        "wrong": [
          "Cute name",
          "Extra ETH"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si un wallet utilise un nom au lieu d'une longue adresse, je fais quoi ?'",
        "correct": "Vérifier nom",
        "wrong": [
          "Nom mignon",
          "ETH extra"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si un wallet usa un nombre en vez de una dirección larga, ¿qué hago?'",
        "correct": "Verificar nombre",
        "wrong": [
          "Nombre lindo",
          "ETH extra"
        ]
      }
    }
  },
  {
    "id": "squig-certified-016",
    "tier": 2,
    "category": "Confirmations",
    "prompt": "InSquignito asks, 'After I send ETH, why might I wait before shopping?'",
    "correct": "Confirmations",
    "wrong": [
      "ETH pants",
      "Dramatic pause"
    ],
    "correctRoast": "Correct. Confirmation first, pants later.",
    "wrongRoast": "Wrong. ETH has no pants. Only block confirmations.",
    "explanation": "Transactions can remain pending until validators include them in blocks and the network confirms them.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'After I send ETH, why might I wait before shopping?'",
        "correct": "Confirmations",
        "wrong": [
          "ETH pants",
          "Dramatic pause"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Après avoir envoyé ETH, pourquoi attendre avant de magasiner ?'",
        "correct": "Confirmations",
        "wrong": [
          "Pantalon ETH",
          "Pause dramatique"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Después de enviar ETH, ¿por qué podría esperar antes de comprar?'",
        "correct": "Confirmaciones",
        "wrong": [
          "Pantalón ETH",
          "Pausa dramática"
        ]
      }
    }
  },
  {
    "id": "squig-certified-017",
    "tier": 2,
    "category": "Security Setup",
    "prompt": "InSquignito asks, 'Before funding a wallet, what security ritual is least embarrassing?'",
    "correct": "Offline backup",
    "wrong": [
      "Public phrase",
      "Bad password"
    ],
    "correctRoast": "Correct. Offline backups: boring, ugly, essential.",
    "wrongRoast": "Wrong. Publicly private is still public, basement scholar.",
    "explanation": "Basic security includes protecting seed phrases, using strong passwords, and avoiding cloud or screenshot exposure.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Before funding a wallet, what security ritual is least embarrassing?'",
        "correct": "Offline backup",
        "wrong": [
          "Public phrase",
          "Bad password"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Avant de financer un wallet, quel rituel sécurité est le moins embarrassant ?'",
        "correct": "Sauvegarde offline",
        "wrong": [
          "Phrase publique",
          "Mot faible"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Antes de financiar un wallet, ¿qué ritual de seguridad da menos vergüenza?'",
        "correct": "Copia offline",
        "wrong": [
          "Frase pública",
          "Clave mala"
        ]
      }
    }
  },
  {
    "id": "squig-certified-018",
    "tier": 2,
    "category": "Scams",
    "prompt": "InSquignito asks, 'A stranger says they can double my ETH for Squig friendship. What is this smell?'",
    "correct": "Scam",
    "wrong": [
      "Guaranteed bonus",
      "Normal handshake"
    ],
    "correctRoast": "Correct. Scam fumes detected. Evacuate the pretty promise.",
    "wrongRoast": "Wrong. Guaranteed doubling is bait wearing a little tuxedo.",
    "explanation": "Common crypto scams promise guaranteed returns or ask for secrets, funds, or urgent actions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A stranger says they can double my ETH for Squig friendship. What is this smell?'",
        "correct": "Scam",
        "wrong": [
          "Guaranteed bonus",
          "Normal handshake"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un inconnu promet de doubler mon ETH pour l'amitié Squig. Quelle est cette odeur ?'",
        "correct": "Arnaque",
        "wrong": [
          "Bonus garanti",
          "Poignée normale"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Un extraño promete duplicar mi ETH por amistad Squig. ¿Qué olor es ese?'",
        "correct": "Estafa",
        "wrong": [
          "Bono garantizado",
          "Saludo normal"
        ]
      }
    }
  },
  {
    "id": "squig-certified-019",
    "tier": 2,
    "category": "Official Links",
    "prompt": "InSquignito asks, 'Where should I find the real Squigs links before connecting a wallet?'",
    "correct": "Official links",
    "wrong": [
      "Sponsored confetti",
      "Urgent mint"
    ],
    "correctRoast": "Correct. Official links first. Confetti later, maybe never.",
    "wrongRoast": "Wrong. Urgent confetti is how wallets get haunted.",
    "explanation": "Phishing often uses fake links, ads, and DMs, so users should verify official sources before connecting.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Where should I find the real Squigs links before connecting a wallet?'",
        "correct": "Official links",
        "wrong": [
          "Sponsored confetti",
          "Urgent mint"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Où trouver les vrais liens Squigs avant de connecter un wallet ?'",
        "correct": "Liens officiels",
        "wrong": [
          "Confettis sponsor",
          "Mint urgent"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Dónde encuentro los enlaces reales de Squigs antes de conectar un wallet?'",
        "correct": "Enlaces oficiales",
        "wrong": [
          "Confeti patrocinado",
          "Mint urgente"
        ]
      }
    }
  },
  {
    "id": "squig-certified-020",
    "tier": 2,
    "category": "Onboarding Summary",
    "prompt": "InSquignito asks, 'What is the cleanest ugly path from normal money toward Squig shopping?'",
    "correct": "Cautious path",
    "wrong": [
      "Floor prayer",
      "Random sends"
    ],
    "correctRoast": "Correct. A cautious path is ugly enough to survive onboarding.",
    "wrongRoast": "Wrong. Prayer to the floor is not an operational plan.",
    "explanation": "A beginner flow should prioritize security, correct networks, verified sources, and risk awareness.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is the cleanest ugly path from normal money toward Squig shopping?'",
        "correct": "Cautious path",
        "wrong": [
          "Floor prayer",
          "Random sends"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quel est le chemin laid le plus propre de l'argent normal vers l'achat de Squigs ?'",
        "correct": "Chemin prudent",
        "wrong": [
          "Prière floor",
          "Envois hasard"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cuál es la ruta fea más limpia desde dinero normal hasta comprar Squigs?'",
        "correct": "Ruta cuidadosa",
        "wrong": [
          "Rezo floor",
          "Envíos azar"
        ]
      }
    }
  },
  {
    "id": "squig-deep-001",
    "tier": 3,
    "category": "NFT Marketplaces",
    "prompt": "InSquignito asks, 'When I open a marketplace, what should I search before I buy a Squig friend?'",
    "correct": "Verified collection",
    "wrong": [
      "Skull emoji",
      "First result"
    ],
    "correctRoast": "Correct. Verification before affection. Ugly but necessary.",
    "wrongRoast": "Wrong. Search results are a swamp with thumbnails.",
    "explanation": "NFT projects can have impersonators, so buyers should verify the official collection or contract.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'When I open a marketplace, what should I search before I buy a Squig friend?'",
        "correct": "Verified collection",
        "wrong": [
          "Skull emoji",
          "First result"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quand j'ouvre une marketplace, que chercher avant d'acheter un ami Squig ?'",
        "correct": "Collection vérifiée",
        "wrong": [
          "Emoji crâne",
          "Premier résultat"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Cuando abro una marketplace, ¿qué busco antes de comprar un amigo Squig?'",
        "correct": "Colección verificada",
        "wrong": [
          "Emoji calavera",
          "Primer resultado"
        ]
      }
    }
  },
  {
    "id": "squig-deep-002",
    "tier": 3,
    "category": "Contract Address",
    "prompt": "InSquignito asks, 'Why does the contract address matter more than a cute collection name?'",
    "correct": "Contract address",
    "wrong": [
      "Cute vibes",
      "Dev pain"
    ],
    "correctRoast": "Correct. Names wear costumes. Contracts leave fingerprints.",
    "wrongRoast": "Wrong. Vibes have lost every audit they ever entered.",
    "explanation": "Checking the contract address helps distinguish the real collection from fake lookalikes.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why does the contract address matter more than a cute collection name?'",
        "correct": "Contract address",
        "wrong": [
          "Cute vibes",
          "Dev pain"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi l'adresse du contrat compte plus qu'un nom de collection mignon ?'",
        "correct": "Adresse contrat",
        "wrong": [
          "Vibes mignonnes",
          "Douleur dev"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué la dirección del contrato importa más que un nombre bonito?'",
        "correct": "Dirección contrato",
        "wrong": [
          "Vibras lindas",
          "Dolor dev"
        ]
      }
    }
  },
  {
    "id": "squig-deep-003",
    "tier": 3,
    "category": "Token ID",
    "prompt": "InSquignito asks, 'What is a token ID when I inspect a Squig?'",
    "correct": "Token ID",
    "wrong": [
      "Shoe size",
      "Handsome rank"
    ],
    "correctRoast": "Correct. Token ID: tiny serial number, maximum goblin energy.",
    "wrongRoast": "Wrong. Handsome rankings are banned for being too pretty.",
    "explanation": "NFTs in a collection are commonly identified by contract address plus token ID.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a token ID when I inspect a Squig?'",
        "correct": "Token ID",
        "wrong": [
          "Shoe size",
          "Handsome rank"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi un token ID quand j'inspecte un Squig ?'",
        "correct": "ID token",
        "wrong": [
          "Pointure Squig",
          "Classement beau"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es un token ID cuando inspecciono un Squig?'",
        "correct": "ID token",
        "wrong": [
          "Talla Squig",
          "Ranking guapo"
        ]
      }
    }
  },
  {
    "id": "squig-deep-004",
    "tier": 3,
    "category": "Metadata",
    "prompt": "InSquignito asks, 'What is NFT metadata?'",
    "correct": "Metadata",
    "wrong": [
      "Gas coupon",
      "Mood ring"
    ],
    "correctRoast": "Correct. Metadata is the token's little file folder.",
    "wrongRoast": "Wrong. Mood rings are poor analysts and worse accountants.",
    "explanation": "Metadata describes or points to the media and attributes associated with an NFT.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is NFT metadata?'",
        "correct": "Metadata",
        "wrong": [
          "Gas coupon",
          "Mood ring"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi les métadonnées NFT ?'",
        "correct": "Métadonnées",
        "wrong": [
          "Coupon gas",
          "Bague humeur"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué son los metadatos de un NFT?'",
        "correct": "Metadatos",
        "wrong": [
          "Cupón gas",
          "Anillo ánimo"
        ]
      }
    }
  },
  {
    "id": "squig-deep-005",
    "tier": 3,
    "category": "Traits",
    "prompt": "InSquignito asks, 'Why do collectors stare at traits like they are soup ingredients?'",
    "correct": "Traits",
    "wrong": [
      "Profit promise",
      "Wallet size"
    ],
    "correctRoast": "Correct. Traits create flavor. They do not create guarantees.",
    "wrongRoast": "Wrong. Profit guarantees are pretty-energy poison.",
    "explanation": "Traits can affect how collectors value NFTs, but they do not guarantee future value.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do collectors stare at traits like they are soup ingredients?'",
        "correct": "Traits",
        "wrong": [
          "Profit promise",
          "Wallet size"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi les collectionneurs fixent les traits comme des ingrédients de soupe ?'",
        "correct": "Traits",
        "wrong": [
          "Profit promis",
          "Taille wallet"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué los coleccionistas miran rasgos como ingredientes de sopa?'",
        "correct": "Rasgos",
        "wrong": [
          "Beneficio prometido",
          "Tamaño wallet"
        ]
      }
    }
  },
  {
    "id": "squig-deep-006",
    "tier": 3,
    "category": "Rarity",
    "prompt": "InSquignito asks, 'If a Squig has a rare trait, what does that actually mean?'",
    "correct": "Less common",
    "wrong": [
      "Forever price",
      "Validator snacks"
    ],
    "correctRoast": "Correct. Rare means less common, not magically rich.",
    "wrongRoast": "Wrong. Validators do not distribute snacks by hat rarity.",
    "explanation": "Rarity measures scarcity of traits within a collection, but market value also depends on demand and context.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If a Squig has a rare trait, what does that actually mean?'",
        "correct": "Less common",
        "wrong": [
          "Forever price",
          "Validator snacks"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si un Squig a un trait rare, ça veut dire quoi vraiment ?'",
        "correct": "Moins commun",
        "wrong": [
          "Prix éternel",
          "Snacks validateurs"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si un Squig tiene un rasgo raro, ¿qué significa realmente?'",
        "correct": "Menos común",
        "wrong": [
          "Precio eterno",
          "Snacks validadores"
        ]
      }
    }
  },
  {
    "id": "squig-deep-007",
    "tier": 3,
    "category": "Floor Price",
    "prompt": "InSquignito asks, 'What is the floor price everyone keeps stepping on?'",
    "correct": "Lowest listing",
    "wrong": [
      "Mandatory price",
      "Nap floor"
    ],
    "correctRoast": "Correct. Lowest listing, not destiny.",
    "wrongRoast": "Wrong. NFTs do not nap on floors. They brood in wallets.",
    "explanation": "Floor price is a marketplace snapshot of the cheapest active listing, not a guaranteed value.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is the floor price everyone keeps stepping on?'",
        "correct": "Lowest listing",
        "wrong": [
          "Mandatory price",
          "Nap floor"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi le floor price que tout le monde piétine ?'",
        "correct": "Listing bas",
        "wrong": [
          "Prix obligatoire",
          "Sieste sol"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es el floor price que todos pisan?'",
        "correct": "Listing bajo",
        "wrong": [
          "Precio obligatorio",
          "Siesta suelo"
        ]
      }
    }
  },
  {
    "id": "squig-deep-008",
    "tier": 3,
    "category": "Listings",
    "prompt": "InSquignito asks, 'What does it mean when a Squig is listed?'",
    "correct": "Sale listing",
    "wrong": [
      "Boarding school",
      "Forced move"
    ],
    "correctRoast": "Correct. Listed means offered, not emotionally abandoned.",
    "wrongRoast": "Wrong. Boarding school for Squigs has terrible reviews.",
    "explanation": "A listing is a sale offer; the NFT remains with the owner until a transaction completes.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What does it mean when a Squig is listed?'",
        "correct": "Sale listing",
        "wrong": [
          "Boarding school",
          "Forced move"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Ça veut dire quoi quand un Squig est listé ?'",
        "correct": "Mise vente",
        "wrong": [
          "Pensionnat",
          "Sortie forcée"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué significa que un Squig esté listado?'",
        "correct": "En venta",
        "wrong": [
          "Internado",
          "Salida forzada"
        ]
      }
    }
  },
  {
    "id": "squig-deep-009",
    "tier": 3,
    "category": "Offers",
    "prompt": "InSquignito asks, 'What is an offer on an NFT?'",
    "correct": "Bid",
    "wrong": [
      "Buyer command",
      "Free gift"
    ],
    "correctRoast": "Correct. Offers ask. They do not command the Squig.",
    "wrongRoast": "Wrong. Buyer goblins have no monarchy here.",
    "explanation": "NFT owners usually choose whether to accept offers, and offers can have expiration times or conditions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is an offer on an NFT?'",
        "correct": "Bid",
        "wrong": [
          "Buyer command",
          "Free gift"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi une offre sur un NFT ?'",
        "correct": "Offre",
        "wrong": [
          "Ordre acheteur",
          "Cadeau gratuit"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es una oferta sobre un NFT?'",
        "correct": "Oferta",
        "wrong": [
          "Orden comprador",
          "Regalo gratis"
        ]
      }
    }
  },
  {
    "id": "squig-deep-010",
    "tier": 3,
    "category": "Buy Now",
    "prompt": "InSquignito asks, 'If I hit buy now on a real listing, what should happen?'",
    "correct": "Wallet purchase",
    "wrong": [
      "Seed phrase",
      "Before gas"
    ],
    "correctRoast": "Correct. Price, gas, wallet confirmation. Then the chain decides.",
    "wrongRoast": "Wrong. Seed phrase requests are trapdoors with glitter.",
    "explanation": "A legitimate purchase should be confirmed through the wallet without revealing the seed phrase.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If I hit buy now on a real listing, what should happen?'",
        "correct": "Wallet purchase",
        "wrong": [
          "Seed phrase",
          "Before gas"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si je clique acheter maintenant sur un vrai listing, que devrait-il arriver ?'",
        "correct": "Achat wallet",
        "wrong": [
          "Phrase seed",
          "Avant gas"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si pulso comprar ahora en un listing real, ¿qué debería pasar?'",
        "correct": "Compra wallet",
        "wrong": [
          "Frase semilla",
          "Antes gas"
        ]
      }
    }
  },
  {
    "id": "squig-deep-011",
    "tier": 3,
    "category": "Gas Spikes",
    "prompt": "InSquignito asks, 'Why did gas suddenly become more expensive while I was emotionally choosing a Squig?'",
    "correct": "Network demand",
    "wrong": [
      "Squig toll",
      "Hesitation fee"
    ],
    "correctRoast": "Correct. Network congestion: the ugly traffic jam.",
    "wrongRoast": "Wrong. The Squig cannot smell hesitation through the mempool. Probably.",
    "explanation": "Gas fees fluctuate with network demand and transaction complexity.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why did gas suddenly become more expensive while I was emotionally choosing a Squig?'",
        "correct": "Network demand",
        "wrong": [
          "Squig toll",
          "Hesitation fee"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi le gas est devenu plus cher pendant que je choisissais un Squig avec émotion ?'",
        "correct": "Demande réseau",
        "wrong": [
          "Péage Squig",
          "Frais hésitation"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué el gas subió mientras elegía un Squig con emoción?'",
        "correct": "Demanda red",
        "wrong": [
          "Peaje Squig",
          "Tarifa duda"
        ]
      }
    }
  },
  {
    "id": "squig-deep-012",
    "tier": 3,
    "category": "Slippage",
    "prompt": "InSquignito asks, 'Is slippage a disease from standing too close to exchanges?'",
    "correct": "Slippage",
    "wrong": [
      "Image cure",
      "Slippery trait"
    ],
    "correctRoast": "Correct. Slippage belongs mostly in swap goblin math.",
    "wrongRoast": "Wrong. Refreshing images has never healed finance.",
    "explanation": "Slippage is common in decentralized token swaps; fixed-price NFT buys usually focus more on listing price and gas.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Is slippage a disease from standing too close to exchanges?'",
        "correct": "Slippage",
        "wrong": [
          "Image cure",
          "Slippery trait"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Le slippage est une maladie d'être trop près des exchanges ?'",
        "correct": "Slippage",
        "wrong": [
          "Soin image",
          "Trait glissant"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿El slippage es una enfermedad por pararse cerca de los exchanges?'",
        "correct": "Slippage",
        "wrong": [
          "Cura imagen",
          "Rasgo resbaloso"
        ]
      }
    }
  },
  {
    "id": "squig-deep-013",
    "tier": 3,
    "category": "Royalties",
    "prompt": "InSquignito asks, 'What are creator royalties in NFT land?'",
    "correct": "Royalties",
    "wrong": [
      "Crown tax",
      "Forever fee"
    ],
    "correctRoast": "Correct. Royalties may exist, but marketplace rules matter.",
    "wrongRoast": "Wrong. Crowns do not create accounting departments.",
    "explanation": "NFT royalties can vary by marketplace and enforcement model, so they should not be assumed to work identically everywhere.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What are creator royalties in NFT land?'",
        "correct": "Royalties",
        "wrong": [
          "Crown tax",
          "Forever fee"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi les royalties créateur au pays des NFT ?'",
        "correct": "Royalties",
        "wrong": [
          "Taxe couronne",
          "Frais éternels"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué son las regalías de creador en tierra NFT?'",
        "correct": "Regalías",
        "wrong": [
          "Impuesto corona",
          "Tarifa eterna"
        ]
      }
    }
  },
  {
    "id": "squig-deep-014",
    "tier": 3,
    "category": "Hidden NFTs",
    "prompt": "InSquignito asks, 'A random NFT appeared in my wallet. Is it a new friend?'",
    "correct": "Phishing bait",
    "wrong": [
      "Friendship egg",
      "Click links"
    ],
    "correctRoast": "Correct. Surprise friend may be trap slug. Do not pet the trap slug.",
    "wrongRoast": "Wrong. Friendship eggs are how phishing learned to hatch.",
    "explanation": "Scammers may send unwanted NFTs with malicious links or prompts; unknown assets should be treated cautiously.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A random NFT appeared in my wallet. Is it a new friend?'",
        "correct": "Phishing bait",
        "wrong": [
          "Friendship egg",
          "Click links"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un NFT aléatoire est apparu dans mon wallet. C'est un nouvel ami ?'",
        "correct": "Piège phishing",
        "wrong": [
          "Œuf ami",
          "Cliquer liens"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Apareció un NFT aleatorio en mi wallet. ¿Es un nuevo amigo?'",
        "correct": "Trampa phishing",
        "wrong": [
          "Huevo amigo",
          "Abrir enlaces"
        ]
      }
    }
  },
  {
    "id": "squig-deep-015",
    "tier": 3,
    "category": "Approvals",
    "prompt": "InSquignito asks, 'Why does a marketplace ask for approval before selling an NFT?'",
    "correct": "Transfer approval",
    "wrong": [
      "Compliment",
      "Profile pic"
    ],
    "correctRoast": "Correct. Approval is permission, not praise.",
    "wrongRoast": "Wrong. Compliments do not move tokens. Thank goodness.",
    "explanation": "NFT approvals grant smart contracts permission to transfer NFTs under certain conditions, so they should be understood before signing.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why does a marketplace ask for approval before selling an NFT?'",
        "correct": "Transfer approval",
        "wrong": [
          "Compliment",
          "Profile pic"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi une marketplace demande une approbation avant de vendre un NFT ?'",
        "correct": "Approbation transfert",
        "wrong": [
          "Compliment",
          "Photo profil"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué una marketplace pide aprobación antes de vender un NFT?'",
        "correct": "Aprobación transferencia",
        "wrong": [
          "Cumplido",
          "Foto perfil"
        ]
      }
    }
  },
  {
    "id": "squig-deep-016",
    "tier": 3,
    "category": "Revoking",
    "prompt": "InSquignito asks, 'What does revoking an approval do?'",
    "correct": "Revoke permission",
    "wrong": [
      "Delete NFT",
      "Gas apology"
    ],
    "correctRoast": "Correct. Permission removed. The goblin key goes back on the hook.",
    "wrongRoast": "Wrong. Gas fees have never apologized, only multiplied.",
    "explanation": "Revoking approvals can reduce risk by removing old or unnecessary permissions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What does revoking an approval do?'",
        "correct": "Revoke permission",
        "wrong": [
          "Delete NFT",
          "Gas apology"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Révoquer une approbation, ça fait quoi ?'",
        "correct": "Révoquer permission",
        "wrong": [
          "Supprimer NFT",
          "Excuse gas"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué hace revocar una aprobación?'",
        "correct": "Revocar permiso",
        "wrong": [
          "Borrar NFT",
          "Disculpa gas"
        ]
      }
    }
  },
  {
    "id": "squig-deep-017",
    "tier": 3,
    "category": "Portfolio View",
    "prompt": "InSquignito asks, 'Why might a wallet scan show Squigs but not ask for a signature?'",
    "correct": "Public data",
    "wrong": [
      "Guessed seed",
      "Magic login"
    ],
    "correctRoast": "Correct. Public chain data is readable. No signature needed for looking.",
    "wrongRoast": "Wrong. Secret guessing belongs in scam fan fiction.",
    "explanation": "Wallet holdings can often be queried publicly by address without requiring the owner to sign.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why might a wallet scan show Squigs but not ask for a signature?'",
        "correct": "Public data",
        "wrong": [
          "Guessed seed",
          "Magic login"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi un scan wallet peut montrer des Squigs sans demander de signature ?'",
        "correct": "Données publiques",
        "wrong": [
          "Seed devinée",
          "Login magique"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué un escaneo de wallet puede mostrar Squigs sin pedir firma?'",
        "correct": "Datos públicos",
        "wrong": [
          "Semilla adivinada",
          "Login mágico"
        ]
      }
    }
  },
  {
    "id": "squig-deep-018",
    "tier": 3,
    "category": "Pending Transactions",
    "prompt": "InSquignito asks, 'My buy transaction is pending. What should I do before smashing buttons?'",
    "correct": "Check status",
    "wrong": [
      "Buy five",
      "Share seed"
    ],
    "correctRoast": "Correct. Panic clicks are pretty. Patience is ugly.",
    "wrongRoast": "Wrong. Duplicate panic is how the mempool learns comedy.",
    "explanation": "Pending transactions may take time; duplicate or rushed actions can cause mistakes or extra fees.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'My buy transaction is pending. What should I do before smashing buttons?'",
        "correct": "Check status",
        "wrong": [
          "Buy five",
          "Share seed"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Ma transaction d'achat est pending. Que faire avant de marteler les boutons ?'",
        "correct": "Vérifier statut",
        "wrong": [
          "Acheter cinq",
          "Partager seed"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Mi compra está pendiente. ¿Qué hago antes de aplastar botones?'",
        "correct": "Verificar estado",
        "wrong": [
          "Comprar cinco",
          "Compartir semilla"
        ]
      }
    }
  },
  {
    "id": "squig-deep-019",
    "tier": 3,
    "category": "Ownership Check",
    "prompt": "InSquignito asks, 'After buying, how do I know the Squig friend is mine?'",
    "correct": "Check ownership",
    "wrong": [
      "Thank email",
      "Legal confetti"
    ],
    "correctRoast": "Correct. Wallet or explorer first, confetti second.",
    "wrongRoast": "Wrong. Confetti is not a settlement layer.",
    "explanation": "On-chain ownership can be checked through wallets, marketplaces, or block explorers.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'After buying, how do I know the Squig friend is mine?'",
        "correct": "Check ownership",
        "wrong": [
          "Thank email",
          "Legal confetti"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Après l'achat, comment savoir si l'ami Squig est à moi ?'",
        "correct": "Vérifier propriété",
        "wrong": [
          "Email merci",
          "Confetti légal"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Después de comprar, ¿cómo sé que el amigo Squig es mío?'",
        "correct": "Verificar propiedad",
        "wrong": [
          "Correo gracias",
          "Confeti legal"
        ]
      }
    }
  },
  {
    "id": "squig-deep-020",
    "tier": 3,
    "category": "Marketplace Summary",
    "prompt": "InSquignito asks, 'What is the ugly marketplace checklist before buying?'",
    "correct": "Buying checklist",
    "wrong": [
      "Trust thumbnail",
      "Fake alpha"
    ],
    "correctRoast": "Correct. Checklist completed. The desk slime nods approvingly.",
    "wrongRoast": "Wrong. Slam-confirm energy is too pretty to survive.",
    "explanation": "Buying NFTs safely requires verification, cost review, and careful wallet confirmation.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is the ugly marketplace checklist before buying?'",
        "correct": "Buying checklist",
        "wrong": [
          "Trust thumbnail",
          "Fake alpha"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quelle est la checklist marketplace laide avant d'acheter ?'",
        "correct": "Checklist achat",
        "wrong": [
          "Confiance miniature",
          "Faux alpha"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cuál es la checklist fea de marketplace antes de comprar?'",
        "correct": "Checklist compra",
        "wrong": [
          "Confiar miniatura",
          "Falso alpha"
        ]
      }
    }
  },
  {
    "id": "squig-internal-001",
    "tier": 4,
    "category": "Phishing",
    "prompt": "InSquignito asks, 'A fake site looks exactly like the real Squigs page. What protects me?'",
    "correct": "Official links",
    "wrong": [
      "Polite site",
      "Crisp logo",
      "Connect first"
    ],
    "correctRoast": "Correct. Pretty clones hate bookmarks and attention.",
    "wrongRoast": "Wrong. Crisp logos have committed unspeakable wallet crimes.",
    "explanation": "Phishing sites imitate real projects, so link verification is a core wallet safety habit.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A fake site looks exactly like the real Squigs page. What protects me?'",
        "correct": "Official links",
        "wrong": [
          "Polite site",
          "Crisp logo",
          "Connect first"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un faux site ressemble exactement à la vraie page Squigs. Qu'est-ce qui me protège ?'",
        "correct": "Liens officiels",
        "wrong": [
          "Site poli",
          "Logo net",
          "Connecter avant"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Un sitio falso se ve igual que la página real de Squigs. ¿Qué me protege?'",
        "correct": "Enlaces oficiales",
        "wrong": [
          "Sitio amable",
          "Logo nítido",
          "Conectar primero"
        ]
      }
    }
  },
  {
    "id": "squig-internal-002",
    "tier": 4,
    "category": "Blind Signing",
    "prompt": "InSquignito asks, 'What is blind signing, and why does it sound like eating soup in a dark room?'",
    "correct": "Blind signing",
    "wrong": [
      "Low brightness",
      "Mint dance",
      "Expert shortcut"
    ],
    "correctRoast": "Correct. Darkness plus permission equals danger soup.",
    "wrongRoast": "Wrong. Low brightness is an eyesight problem, not the full security problem.",
    "explanation": "Blind signing can be risky because the user may approve harmful permissions or transactions without knowing it.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is blind signing, and why does it sound like eating soup in a dark room?'",
        "correct": "Blind signing",
        "wrong": [
          "Low brightness",
          "Mint dance",
          "Expert shortcut"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi signer à l'aveugle, et pourquoi ça ressemble à manger de la soupe dans le noir ?'",
        "correct": "Signature aveugle",
        "wrong": [
          "Luminosité basse",
          "Danse mint",
          "Raccourci expert"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es firmar a ciegas, y por qué suena a comer sopa a oscuras?'",
        "correct": "Firma ciega",
        "wrong": [
          "Brillo bajo",
          "Baile mint",
          "Atajo experto"
        ]
      }
    }
  },
  {
    "id": "squig-internal-003",
    "tier": 4,
    "category": "Hardware Wallets",
    "prompt": "InSquignito asks, 'Why do collectors use hardware wallets for prized Squig friends?'",
    "correct": "Hardware wallet",
    "wrong": [
      "Heavy rarity",
      "Scam immunity",
      "Battery Squig"
    ],
    "correctRoast": "Correct. Offline key goblin, physical button, calmer vault.",
    "wrongRoast": "Wrong. Hardware wallets reduce risk, not all human mistakes.",
    "explanation": "Hardware wallets can improve security by isolating private keys, but users still need safe signing habits.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do collectors use hardware wallets for prized Squig friends?'",
        "correct": "Hardware wallet",
        "wrong": [
          "Heavy rarity",
          "Scam immunity",
          "Battery Squig"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi les collectionneurs utilisent des hardware wallets pour des Squigs précieux ?'",
        "correct": "Wallet matériel",
        "wrong": [
          "Rareté lourde",
          "Immunité scams",
          "Batterie Squig"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué los coleccionistas usan hardware wallets para Squigs valiosos?'",
        "correct": "Wallet físico",
        "wrong": [
          "Rareza pesada",
          "Inmunidad scams",
          "Batería Squig"
        ]
      }
    }
  },
  {
    "id": "squig-internal-004",
    "tier": 4,
    "category": "Burner Wallets",
    "prompt": "InSquignito asks, 'What is a burner wallet useful for?'",
    "correct": "Burner wallet",
    "wrong": [
      "Actual fire",
      "Main storage",
      "Spicy name"
    ],
    "correctRoast": "Correct. Tiny disposable wallet enters the suspicious hallway first.",
    "wrongRoast": "Wrong. Fire does not interact with ERC-721s, sadly.",
    "explanation": "A separate low-value wallet can reduce exposure when interacting with unknown apps.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a burner wallet useful for?'",
        "correct": "Burner wallet",
        "wrong": [
          "Actual fire",
          "Main storage",
          "Spicy name"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un burner wallet sert à quoi ?'",
        "correct": "Wallet jetable",
        "wrong": [
          "Feu réel",
          "Stockage principal",
          "Nom piquant"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Para qué sirve un burner wallet?'",
        "correct": "Wallet burner",
        "wrong": [
          "Fuego real",
          "Almacén principal",
          "Nombre picante"
        ]
      }
    }
  },
  {
    "id": "squig-internal-005",
    "tier": 4,
    "category": "Token Standards",
    "prompt": "InSquignito asks, 'Why do people say ERC-721 or ERC-1155 around NFTs?'",
    "correct": "Token standards",
    "wrong": [
      "Ugly ranking",
      "Support tickets",
      "Gas coupons"
    ],
    "correctRoast": "Correct. Standards: boring words that make tokens interoperable.",
    "wrongRoast": "Wrong. Ugly rankings are spiritual, not ERC-compliant.",
    "explanation": "Token standards help wallets, marketplaces, and contracts interact with NFTs in predictable ways.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do people say ERC-721 or ERC-1155 around NFTs?'",
        "correct": "Token standards",
        "wrong": [
          "Ugly ranking",
          "Support tickets",
          "Gas coupons"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi les gens disent ERC-721 ou ERC-1155 autour des NFT ?'",
        "correct": "Standards token",
        "wrong": [
          "Classement laid",
          "Tickets support",
          "Coupons gas"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué la gente dice ERC-721 o ERC-1155 cerca de los NFT?'",
        "correct": "Estándares token",
        "wrong": [
          "Ranking feo",
          "Tickets soporte",
          "Cupones gas"
        ]
      }
    }
  },
  {
    "id": "squig-internal-006",
    "tier": 4,
    "category": "Smart Contracts",
    "prompt": "InSquignito asks, 'What is a smart contract?'",
    "correct": "Blockchain code",
    "wrong": [
      "Smart student",
      "Wallet PDF",
      "Price bot"
    ],
    "correctRoast": "Correct. Code rules with chain teeth.",
    "wrongRoast": "Wrong. Straight A contracts still cannot deploy themselves.",
    "explanation": "Smart contracts are programs stored and executed on blockchains.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is a smart contract?'",
        "correct": "Blockchain code",
        "wrong": [
          "Smart student",
          "Wallet PDF",
          "Price bot"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi un smart contract ?'",
        "correct": "Code blockchain",
        "wrong": [
          "Bon élève",
          "PDF wallet",
          "Bot prix"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es un smart contract?'",
        "correct": "Código blockchain",
        "wrong": [
          "Alumno listo",
          "PDF wallet",
          "Bot precios"
        ]
      }
    }
  },
  {
    "id": "squig-internal-007",
    "tier": 4,
    "category": "Immutable Records",
    "prompt": "InSquignito asks, 'Why do people say on-chain actions are hard to undo?'",
    "correct": "Permanent-ish",
    "wrong": [
      "Tuesday amnesia",
      "Undo button",
      "Free rewind"
    ],
    "correctRoast": "Correct. The chain remembers like a petty filing cabinet.",
    "wrongRoast": "Wrong. Complaints are not a consensus mechanism.",
    "explanation": "Confirmed blockchain transactions are designed to be tamper-resistant and are usually not reversible by a central support desk.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do people say on-chain actions are hard to undo?'",
        "correct": "Permanent-ish",
        "wrong": [
          "Tuesday amnesia",
          "Undo button",
          "Free rewind"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi dit-on que les actions on-chain sont difficiles à annuler ?'",
        "correct": "Quasi permanent",
        "wrong": [
          "Oubli mardi",
          "Bouton annuler",
          "Retour gratuit"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué dicen que las acciones on-chain son difíciles de deshacer?'",
        "correct": "Casi permanente",
        "wrong": [
          "Olvido martes",
          "Botón deshacer",
          "Rebobinado gratis"
        ]
      }
    }
  },
  {
    "id": "squig-internal-008",
    "tier": 4,
    "category": "Wrapped ETH",
    "prompt": "InSquignito asks, 'What is WETH, and why did ETH put on a wrapper?'",
    "correct": "Wrapped ETH",
    "wrong": [
      "Birthday wrap",
      "Cheaper ETH",
      "Always scam"
    ],
    "correctRoast": "Correct. ETH wore a standardized jacket for contract business.",
    "wrongRoast": "Wrong. Birthday wrapping does not pass token standards.",
    "explanation": "WETH exists because some decentralized apps need ETH in ERC-20 token form.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is WETH, and why did ETH put on a wrapper?'",
        "correct": "Wrapped ETH",
        "wrong": [
          "Birthday wrap",
          "Cheaper ETH",
          "Always scam"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'C'est quoi WETH, et pourquoi ETH a mis un emballage ?'",
        "correct": "ETH emballé",
        "wrong": [
          "Cadeau Squig",
          "ETH moinscher",
          "Toujours arnaque"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué es WETH, y por qué ETH se puso envoltorio?'",
        "correct": "ETH envuelto",
        "wrong": [
          "Regalo Squig",
          "ETH barato",
          "Siempre estafa"
        ]
      }
    }
  },
  {
    "id": "squig-internal-009",
    "tier": 4,
    "category": "Bids And WETH",
    "prompt": "InSquignito asks, 'Why might making an NFT offer require WETH instead of plain ETH?'",
    "correct": "WETH offers",
    "wrong": [
      "Damp vibes",
      "Shy ETH",
      "Festive coins"
    ],
    "correctRoast": "Correct. Contract mechanics, not damp aesthetics.",
    "wrongRoast": "Wrong. Damp paperwork is a culture, not a settlement method.",
    "explanation": "Offers often need tokenized funds that smart contracts can handle according to marketplace rules.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why might making an NFT offer require WETH instead of plain ETH?'",
        "correct": "WETH offers",
        "wrong": [
          "Damp vibes",
          "Shy ETH",
          "Festive coins"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi faire une offre NFT peut demander du WETH au lieu d'ETH simple ?'",
        "correct": "Offres WETH",
        "wrong": [
          "Vibes humides",
          "ETH timide",
          "Pièces festives"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué hacer una oferta NFT puede requerir WETH en vez de ETH normal?'",
        "correct": "Ofertas WETH",
        "wrong": [
          "Vibras húmedas",
          "ETH tímido",
          "Monedas festivas"
        ]
      }
    }
  },
  {
    "id": "squig-internal-010",
    "tier": 4,
    "category": "Liquidity",
    "prompt": "InSquignito asks, 'Why is an NFT harder to sell than swapping a common token sometimes?'",
    "correct": "Matching buyer",
    "wrong": [
      "Embarrassed NFT",
      "Floor buyer",
      "Instant sale"
    ],
    "correctRoast": "Correct. Unique assets need matching collectors.",
    "wrongRoast": "Wrong. The floor buyer is a myth with very dusty shoes.",
    "explanation": "NFT liquidity varies by collection, demand, price, and individual token appeal.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why is an NFT harder to sell than swapping a common token sometimes?'",
        "correct": "Matching buyer",
        "wrong": [
          "Embarrassed NFT",
          "Floor buyer",
          "Instant sale"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi un NFT est parfois plus dur à vendre qu'un token courant ?'",
        "correct": "Acheteur trouvé",
        "wrong": [
          "NFT gêné",
          "Acheteur sol",
          "Vente instant"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué a veces un NFT es más difícil de vender que cambiar un token común?'",
        "correct": "Comprador correcto",
        "wrong": [
          "NFT avergonzado",
          "Comprador suelo",
          "Venta instantánea"
        ]
      }
    }
  },
  {
    "id": "squig-internal-011",
    "tier": 4,
    "category": "Price Discovery",
    "prompt": "InSquignito asks, 'Why do two Squigs in the same collection sell for different prices?'",
    "correct": "Market factors",
    "wrong": [
      "Personality tax",
      "Legal price",
      "Blue punishment"
    ],
    "correctRoast": "Correct. Value is a stew, and the spoon is weird.",
    "wrongRoast": "Wrong. One legal price would make collecting far less chaotic.",
    "explanation": "NFT prices depend on multiple factors and are set by market participants, not a single official number.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do two Squigs in the same collection sell for different prices?'",
        "correct": "Market factors",
        "wrong": [
          "Personality tax",
          "Legal price",
          "Blue punishment"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi deux Squigs de la même collection se vendent à des prix différents ?'",
        "correct": "Facteurs marché",
        "wrong": [
          "Taxe personnalité",
          "Prix légal",
          "Punition bleue"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué dos Squigs de la misma colección se venden a precios distintos?'",
        "correct": "Factores mercado",
        "wrong": [
          "Impuesto personalidad",
          "Precio legal",
          "Castigo azul"
        ]
      }
    }
  },
  {
    "id": "squig-internal-012",
    "tier": 4,
    "category": "Taxes",
    "prompt": "InSquignito asks, 'Why do responsible humans keep records of NFT purchases and sales?'",
    "correct": "Tax records",
    "wrong": [
      "Tall wallet",
      "Web2 only",
      "Stamp cancel"
    ],
    "correctRoast": "Correct. The paperwork goblin follows across chains.",
    "wrongRoast": "Wrong. Web3 did not delete the tax goblin. It gave it analytics.",
    "explanation": "Users should keep records and consult qualified guidance for tax obligations in their jurisdiction.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why do responsible humans keep records of NFT purchases and sales?'",
        "correct": "Tax records",
        "wrong": [
          "Tall wallet",
          "Web2 only",
          "Stamp cancel"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi les humains responsables gardent des traces d'achats et ventes NFT ?'",
        "correct": "Registres fiscaux",
        "wrong": [
          "Wallet grand",
          "Web2 seulement",
          "Tampon annule"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué los humanos responsables guardan registros de compras y ventas NFT?'",
        "correct": "Registros fiscales",
        "wrong": [
          "Wallet alto",
          "Solo web2",
          "Sello cancela"
        ]
      }
    }
  },
  {
    "id": "squig-internal-013",
    "tier": 4,
    "category": "Risk Budget",
    "prompt": "InSquignito asks, 'How much should a beginner risk while learning NFTs?'",
    "correct": "Risk budget",
    "wrong": [
      "Everything",
      "Borrowed funds",
      "Influencer whisper"
    ],
    "correctRoast": "Correct. Survival budget. Ugly and boring, the strongest combo.",
    "wrongRoast": "Wrong. Financial drama is a pretty villain wearing chart cologne.",
    "explanation": "NFT purchases are risky and speculative, so beginners should limit exposure.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'How much should a beginner risk while learning NFTs?'",
        "correct": "Risk budget",
        "wrong": [
          "Everything",
          "Borrowed funds",
          "Influencer whisper"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Combien un débutant devrait risquer en apprenant les NFT ?'",
        "correct": "Budget risque",
        "wrong": [
          "Tout",
          "Argent emprunté",
          "Murmure influenceur"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cuánto debería arriesgar un principiante al aprender NFT?'",
        "correct": "Presupuesto riesgo",
        "wrong": [
          "Todo",
          "Fondos prestados",
          "Susurro influencer"
        ]
      }
    }
  },
  {
    "id": "squig-internal-014",
    "tier": 4,
    "category": "Influencers",
    "prompt": "InSquignito asks, 'A famous account says a collection will moon. What should I do?'",
    "correct": "Research",
    "wrong": [
      "Follower count",
      "Send seed",
      "Moon contract"
    ],
    "correctRoast": "Correct. Followers are not a risk control.",
    "wrongRoast": "Wrong. Follower count is not a due diligence certificate.",
    "explanation": "Influencer posts may be biased, sponsored, or wrong; investment decisions should not rely on hype alone.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A famous account says a collection will moon. What should I do?'",
        "correct": "Research",
        "wrong": [
          "Follower count",
          "Send seed",
          "Moon contract"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un compte célèbre dit qu'une collection va moon. Je fais quoi ?'",
        "correct": "Recherche",
        "wrong": [
          "Abonnés",
          "Phrase seed",
          "Lune contrat"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Una cuenta famosa dice que una colección va a moon. ¿Qué hago?'",
        "correct": "Investigar",
        "wrong": [
          "Seguidores",
          "Enviar semilla",
          "Luna contrato"
        ]
      }
    }
  },
  {
    "id": "squig-internal-015",
    "tier": 4,
    "category": "Official Contract From Config",
    "prompt": "InSquignito asks, 'If the game scans Squigs from an official contract, what should code use as the source of truth?'",
    "correct": "Config source",
    "wrong": [
      "Chat address",
      "Cute contract",
      "Sneeze address"
    ],
    "correctRoast": "Correct. Config is the filing cabinet. Chat is the swamp.",
    "wrongRoast": "Wrong. Cute thumbnails have never passed address verification.",
    "explanation": "Apps should use trusted configuration or official sources for contract addresses, especially when scanning holdings.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If the game scans Squigs from an official contract, what should code use as the source of truth?'",
        "correct": "Config source",
        "wrong": [
          "Chat address",
          "Cute contract",
          "Sneeze address"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si le jeu scanne des Squigs depuis un contrat officiel, quelle source de vérité doit utiliser le code ?'",
        "correct": "Source config",
        "wrong": [
          "Adresse chat",
          "Contrat mignon",
          "Adresse éternuée"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si el juego escanea Squigs desde un contrato oficial, ¿qué fuente de verdad debe usar el código?'",
        "correct": "Fuente config",
        "wrong": [
          "Dirección chat",
          "Contrato lindo",
          "Dirección estornudo"
        ]
      }
    }
  },
  {
    "id": "squig-internal-016",
    "tier": 4,
    "category": "No Signature Scans",
    "prompt": "InSquignito asks, 'Why is a wallet scan safer when it only asks for an address and not a signature?'",
    "correct": "Public read",
    "wrong": [
      "Pretty signatures",
      "Address passwords",
      "Secret scans"
    ],
    "correctRoast": "Correct. Looking at public data needs no handshake of doom.",
    "wrongRoast": "Wrong. Addresses are public identifiers, not password burritos.",
    "explanation": "Public blockchain data can be queried by address; signatures should not be needed just to display holdings.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why is a wallet scan safer when it only asks for an address and not a signature?'",
        "correct": "Public read",
        "wrong": [
          "Pretty signatures",
          "Address passwords",
          "Secret scans"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi un scan wallet est plus sûr quand il demande seulement une adresse, pas une signature ?'",
        "correct": "Lecture publique",
        "wrong": [
          "Signatures jolies",
          "Adresses mots",
          "Scans secrets"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué un escaneo de wallet es más seguro si solo pide dirección y no firma?'",
        "correct": "Lectura pública",
        "wrong": [
          "Firmas lindas",
          "Direcciones claves",
          "Escaneos secretos"
        ]
      }
    }
  },
  {
    "id": "squig-internal-017",
    "tier": 4,
    "category": "Claim Records",
    "prompt": "InSquignito asks, 'If an app says rewards are pending claims, what does that mean?'",
    "correct": "Pending claim",
    "wrong": [
      "Token teleport",
      "Private key",
      "Paid twice"
    ],
    "correctRoast": "Correct. Pending paperwork, not instant token soup.",
    "wrongRoast": "Wrong. Claim codes are paperwork labels, not magic withdrawal roots.",
    "explanation": "A pending claim record can track eligibility without automatically sending tokens.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If an app says rewards are pending claims, what does that mean?'",
        "correct": "Pending claim",
        "wrong": [
          "Token teleport",
          "Private key",
          "Paid twice"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si une app dit que des récompenses sont des claims pending, ça veut dire quoi ?'",
        "correct": "Demande attente",
        "wrong": [
          "Téléport token",
          "Clé privée",
          "Payé deuxfois"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si una app dice que las recompensas son claims pendientes, ¿qué significa?'",
        "correct": "Reclamo pendiente",
        "wrong": [
          "Teletransporte token",
          "Clave privada",
          "Pagado doble"
        ]
      }
    }
  },
  {
    "id": "squig-internal-018",
    "tier": 4,
    "category": "Revoke Routine",
    "prompt": "InSquignito asks, 'After using marketplaces for months, why review old approvals?'",
    "correct": "Review approvals",
    "wrong": [
      "Dust NFTs",
      "More rarity",
      "Lonely markets"
    ],
    "correctRoast": "Correct. Clean old permissions like moldy fridge soup.",
    "wrongRoast": "Wrong. Revoking does not change rarity. It changes permission exposure.",
    "explanation": "Approvals can remain active until revoked, so periodic review can help limit risk.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'After using marketplaces for months, why review old approvals?'",
        "correct": "Review approvals",
        "wrong": [
          "Dust NFTs",
          "More rarity",
          "Lonely markets"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Après des mois de marketplaces, pourquoi revoir les anciennes approbations ?'",
        "correct": "Revoir approbations",
        "wrong": [
          "NFT poussière",
          "Plus rareté",
          "Marchés seuls"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Tras meses usando marketplaces, ¿por qué revisar permisos viejos?'",
        "correct": "Revisar permisos",
        "wrong": [
          "NFT polvo",
          "Más rareza",
          "Mercados solos"
        ]
      }
    }
  },
  {
    "id": "squig-internal-019",
    "tier": 4,
    "category": "Bridge Caution",
    "prompt": "InSquignito asks, 'Why should a beginner be careful with bridges between chains?'",
    "correct": "Bridge risk",
    "wrong": [
      "Decoration",
      "Safer bridge",
      "Squig twin"
    ],
    "correctRoast": "Correct. Bridges are advanced hallways with trapdoor potential.",
    "wrongRoast": "Wrong. Decorative furniture does not custody assets. Usually.",
    "explanation": "Cross-chain bridges can introduce additional technical and security risks.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why should a beginner be careful with bridges between chains?'",
        "correct": "Bridge risk",
        "wrong": [
          "Decoration",
          "Safer bridge",
          "Squig twin"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi un débutant doit être prudent avec les bridges entre chaînes ?'",
        "correct": "Risque bridge",
        "wrong": [
          "Décoration",
          "Bridge sûr",
          "Jumeau Squig"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué un principiante debe tener cuidado con bridges entre cadenas?'",
        "correct": "Riesgo bridge",
        "wrong": [
          "Decoración",
          "Bridge seguro",
          "Gemelo Squig"
        ]
      }
    }
  },
  {
    "id": "squig-internal-020",
    "tier": 4,
    "category": "Security Summary",
    "prompt": "InSquignito asks, 'What is the Ugly Labs internal security doctrine?'",
    "correct": "Security routine",
    "wrong": [
      "Trust urgency",
      "One wallet",
      "DM cart"
    ],
    "correctRoast": "Correct. Ugly doctrine approved. The filing cabinet salutes.",
    "wrongRoast": "Wrong. Hope beautifully is how wallets become folklore.",
    "explanation": "A strong NFT safety routine combines source verification, key protection, cautious signing, and permission hygiene.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is the Ugly Labs internal security doctrine?'",
        "correct": "Security routine",
        "wrong": [
          "Trust urgency",
          "One wallet",
          "DM cart"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Quelle est la doctrine sécurité interne d'Ugly Labs ?'",
        "correct": "Routine sécurité",
        "wrong": [
          "Urgence fiable",
          "Wallet unique",
          "Panier DM"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cuál es la doctrina interna de seguridad de Ugly Labs?'",
        "correct": "Rutina seguridad",
        "wrong": [
          "Urgencia fiable",
          "Wallet único",
          "Carrito DM"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-001",
    "tier": 5,
    "category": "End To End Flow",
    "prompt": "InSquignito asks, 'Put the whole beginner path in order so I can buy a Squig friend without becoming soup.'",
    "correct": "Safe order",
    "wrong": [
      "Buy first",
      "Paste seed",
      "Loud ads"
    ],
    "correctRoast": "Correct. The path is ugly, cautious, and not soup.",
    "wrongRoast": "Wrong. Soup has been achieved, but not onboarding.",
    "explanation": "An end-to-end NFT purchase flow should prioritize education, security, correct funding, verification, and careful confirmation.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Put the whole beginner path in order so I can buy a Squig friend without becoming soup.'",
        "correct": "Safe order",
        "wrong": [
          "Buy first",
          "Paste seed",
          "Loud ads"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Mets tout le chemin débutant dans l'ordre pour acheter un ami Squig sans devenir soupe.'",
        "correct": "Ordre sûr",
        "wrong": [
          "Acheter avant",
          "Coller seed",
          "Pubs fortes"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Ordena todo el camino principiante para comprar un amigo Squig sin volverse sopa.'",
        "correct": "Orden seguro",
        "wrong": [
          "Comprar primero",
          "Pegar semilla",
          "Anuncios fuertes"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-002",
    "tier": 5,
    "category": "Official Collection",
    "prompt": "InSquignito asks, 'How do I avoid buying a fake Squig wearing a stolen mustache?'",
    "correct": "Verify collection",
    "wrong": [
      "Any Squig",
      "Cheapest fake",
      "Random DM"
    ],
    "correctRoast": "Correct. Mustache theft denied.",
    "wrongRoast": "Wrong. The stolen mustache just opened a marketplace account.",
    "explanation": "Fake collections can copy names and images, so official links and contract verification are essential.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'How do I avoid buying a fake Squig wearing a stolen mustache?'",
        "correct": "Verify collection",
        "wrong": [
          "Any Squig",
          "Cheapest fake",
          "Random DM"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Comment éviter d'acheter un faux Squig avec moustache volée ?'",
        "correct": "Vérifier collection",
        "wrong": [
          "Tout Squig",
          "Faux moinscher",
          "DM hasard"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Cómo evito comprar un Squig falso con bigote robado?'",
        "correct": "Verificar colección",
        "wrong": [
          "Cualquier Squig",
          "Falso barato",
          "DM azar"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-003",
    "tier": 5,
    "category": "Final Wallet Prompt",
    "prompt": "InSquignito asks, 'Right before confirming a Squig purchase, what should match my intention?'",
    "correct": "Match details",
    "wrong": [
      "Button color",
      "Rocket count",
      "Cursor mood"
    ],
    "correctRoast": "Correct. Every detail gets inspected by the ugly microscope.",
    "wrongRoast": "Wrong. Cursor confidence has drained many wallets.",
    "explanation": "Final confirmation should include reviewing all transaction details before signing.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Right before confirming a Squig purchase, what should match my intention?'",
        "correct": "Match details",
        "wrong": [
          "Button color",
          "Rocket count",
          "Cursor mood"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Juste avant de confirmer un achat Squig, qu'est-ce qui doit correspondre à mon intention ?'",
        "correct": "Détails bons",
        "wrong": [
          "Couleur bouton",
          "Nombre fusées",
          "Humeur curseur"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Justo antes de confirmar una compra Squig, ¿qué debe coincidir con mi intención?'",
        "correct": "Detalles correctos",
        "wrong": [
          "Color botón",
          "Cuenta cohetes",
          "Humor cursor"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-004",
    "tier": 5,
    "category": "Seed Phrase Disaster",
    "prompt": "InSquignito asks, 'Support asks for my seed phrase to help recover a failed NFT buy. What do I do?'",
    "correct": "Refuse",
    "wrong": [
      "Send fast",
      "Half safe",
      "Spoiler tags"
    ],
    "correctRoast": "Correct. The phrase stays buried. Support can survive without it.",
    "wrongRoast": "Wrong. Half a disaster is still a disaster wearing shorts.",
    "explanation": "Seed phrases and private keys should never be shared with support staff, websites, or community members.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Support asks for my seed phrase to help recover a failed NFT buy. What do I do?'",
        "correct": "Refuse",
        "wrong": [
          "Send fast",
          "Half safe",
          "Spoiler tags"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Le support demande ma phrase seed pour récupérer un achat NFT raté. Je fais quoi ?'",
        "correct": "Refuser",
        "wrong": [
          "Envoyer vite",
          "Moitié sûre",
          "Tags spoiler"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Soporte pide mi frase semilla para recuperar una compra NFT fallida. ¿Qué hago?'",
        "correct": "Rechazar",
        "wrong": [
          "Enviar rápido",
          "Media segura",
          "Etiquetas spoiler"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-005",
    "tier": 5,
    "category": "Exchange To Wallet Error",
    "prompt": "InSquignito asks, 'I withdrew ETH but picked the wrong network. What lesson should I learn?'",
    "correct": "Network lesson",
    "wrong": [
      "Decorative labels",
      "Lunch forward",
      "Free practice"
    ],
    "correctRoast": "Correct. Chain hallways are separate. Read the door before entering.",
    "wrongRoast": "Wrong. The chain does not forward mail because you looked sad.",
    "explanation": "Using the wrong network can cause funds to be inaccessible in the intended wallet or app.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'I withdrew ETH but picked the wrong network. What lesson should I learn?'",
        "correct": "Network lesson",
        "wrong": [
          "Decorative labels",
          "Lunch forward",
          "Free practice"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'J'ai retiré ETH mais choisi le mauvais réseau. Quelle leçon apprendre ?'",
        "correct": "Leçon réseau",
        "wrong": [
          "Étiquettes déco",
          "Transfert midi",
          "Pratique gratuite"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Retiré ETH pero elegí la red incorrecta. ¿Qué lección aprendo?'",
        "correct": "Lección red",
        "wrong": [
          "Etiquetas decorativas",
          "Reenvío almuerzo",
          "Práctica gratis"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-006",
    "tier": 5,
    "category": "Marketplace Offer Risk",
    "prompt": "InSquignito asks, 'I received an offer that looks huge. What should I check before accepting?'",
    "correct": "Offer terms",
    "wrong": [
      "Big numbers",
      "Always ETH",
      "Compliment sale"
    ],
    "correctRoast": "Correct. Big numbers still report to the inspection goblin.",
    "wrongRoast": "Wrong. Big numbers can be bait with commas.",
    "explanation": "Offers can vary by currency and terms, so owners should verify details before accepting.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'I received an offer that looks huge. What should I check before accepting?'",
        "correct": "Offer terms",
        "wrong": [
          "Big numbers",
          "Always ETH",
          "Compliment sale"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'J'ai reçu une offre énorme. Que vérifier avant d'accepter ?'",
        "correct": "Termes offre",
        "wrong": [
          "Gros nombres",
          "Toujours ETH",
          "Vente compliment"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Recibí una oferta enorme. ¿Qué reviso antes de aceptarla?'",
        "correct": "Términos oferta",
        "wrong": [
          "Números grandes",
          "Siempre ETH",
          "Venta cumplido"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-007",
    "tier": 5,
    "category": "Approval Attack",
    "prompt": "InSquignito asks, 'A site asks for unlimited approval to move all my NFTs. What is the cautious response?'",
    "correct": "Limit approval",
    "wrong": [
      "Unlimited friendship",
      "Approve twice",
      "Image viewing"
    ],
    "correctRoast": "Correct. Unlimited permission is a very large door.",
    "wrongRoast": "Wrong. Unlimited friendship is how the door stole the hinges.",
    "explanation": "Broad approvals can be dangerous because compromised or malicious contracts may move assets.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A site asks for unlimited approval to move all my NFTs. What is the cautious response?'",
        "correct": "Limit approval",
        "wrong": [
          "Unlimited friendship",
          "Approve twice",
          "Image viewing"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Un site demande une approbation illimitée pour déplacer tous mes NFT. Réponse prudente ?'",
        "correct": "Limiter approbation",
        "wrong": [
          "Amitié illimitée",
          "Approuver deux",
          "Voir images"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Un sitio pide aprobación ilimitada para mover todos mis NFT. ¿Respuesta cauta?'",
        "correct": "Limitar aprobación",
        "wrong": [
          "Amistad ilimitada",
          "Aprobar doble",
          "Ver imágenes"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-008",
    "tier": 5,
    "category": "Cold Storage",
    "prompt": "InSquignito asks, 'After buying a valuable Squig, where might a cautious collector keep it?'",
    "correct": "Vault wallet",
    "wrong": [
      "Exchange wait",
      "Suspicious wallet",
      "Screenshot folder"
    ],
    "correctRoast": "Correct. Vault wallet vibes: less clicking, more guarding.",
    "wrongRoast": "Wrong. Screenshot folders own pixels, not tokens.",
    "explanation": "Collectors often separate valuable assets from hot wallets used for frequent interactions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'After buying a valuable Squig, where might a cautious collector keep it?'",
        "correct": "Vault wallet",
        "wrong": [
          "Exchange wait",
          "Suspicious wallet",
          "Screenshot folder"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Après avoir acheté un Squig précieux, où un collectionneur prudent pourrait-il le garder ?'",
        "correct": "Wallet coffre",
        "wrong": [
          "Attente exchange",
          "Wallet suspect",
          "Dossier capture"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Tras comprar un Squig valioso, ¿dónde lo guardaría un coleccionista cauto?'",
        "correct": "Wallet bóveda",
        "wrong": [
          "Espera exchange",
          "Wallet sospechoso",
          "Carpeta captura"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-009",
    "tier": 5,
    "category": "Floor Price Trap",
    "prompt": "InSquignito asks, 'Why should I not assume the floor price is what I can always sell for?'",
    "correct": "Floor snapshot",
    "wrong": [
      "Guaranteed exit",
      "Mat buyer",
      "Instant liquidity"
    ],
    "correctRoast": "Correct. The floor is a snapshot, not a rescue helicopter.",
    "wrongRoast": "Wrong. The buyer under the mat was lint.",
    "explanation": "NFT liquidity and prices can change quickly, and listings do not guarantee sales.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why should I not assume the floor price is what I can always sell for?'",
        "correct": "Floor snapshot",
        "wrong": [
          "Guaranteed exit",
          "Mat buyer",
          "Instant liquidity"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi ne pas supposer que le floor price est toujours mon prix de sortie ?'",
        "correct": "Snapshot floor",
        "wrong": [
          "Sortie garantie",
          "Acheteur paillasson",
          "Liquidité instant"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué no asumir que el floor price siempre es mi precio de venta?'",
        "correct": "Foto floor",
        "wrong": [
          "Salida garantizada",
          "Comprador alfombra",
          "Liquidez instant"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-010",
    "tier": 5,
    "category": "Community Verification",
    "prompt": "InSquignito asks, 'A Discord announcement says urgent migration. What should I verify?'",
    "correct": "Verify announcement",
    "wrong": [
      "Urgent safe",
      "Seed migration",
      "Siren truth"
    ],
    "correctRoast": "Correct. Urgency goes into the suspicious bucket.",
    "wrongRoast": "Wrong. Siren emojis are not a security audit.",
    "explanation": "Scammers often use urgency and fake announcements to push unsafe wallet actions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'A Discord announcement says urgent migration. What should I verify?'",
        "correct": "Verify announcement",
        "wrong": [
          "Urgent safe",
          "Seed migration",
          "Siren truth"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Une annonce Discord dit migration urgente. Que dois-je vérifier ?'",
        "correct": "Vérifier annonce",
        "wrong": [
          "Urgent sûr",
          "Migration seed",
          "Sirènes vraies"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Un anuncio de Discord dice migración urgente. ¿Qué debo verificar?'",
        "correct": "Verificar anuncio",
        "wrong": [
          "Urgente seguro",
          "Migración semilla",
          "Sirenas verdad"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-011",
    "tier": 5,
    "category": "Block Explorer",
    "prompt": "InSquignito asks, 'Why would I use a block explorer after buying or transferring?'",
    "correct": "Explorer check",
    "wrong": [
      "Stare faster",
      "Support coupons",
      "Edit transaction"
    ],
    "correctRoast": "Correct. Explorer: chain window, not chain steering wheel.",
    "wrongRoast": "Wrong. Staring improves drama, not finality.",
    "explanation": "Block explorers let users inspect public blockchain data, but they do not reverse or control transactions.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why would I use a block explorer after buying or transferring?'",
        "correct": "Explorer check",
        "wrong": [
          "Stare faster",
          "Support coupons",
          "Edit transaction"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi utiliser un block explorer après achat ou transfert ?'",
        "correct": "Vérifier explorer",
        "wrong": [
          "Regarder vite",
          "Coupons support",
          "Modifier transaction"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué usar un block explorer después de comprar o transferir?'",
        "correct": "Revisar explorer",
        "wrong": [
          "Mirar rápido",
          "Cupones soporte",
          "Editar transacción"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-012",
    "tier": 5,
    "category": "Metadata Delay",
    "prompt": "InSquignito asks, 'My new Squig image is not showing yet. Does that mean I lost it?'",
    "correct": "Ownership check",
    "wrong": [
      "Token ran",
      "Gas refunds",
      "Wake transfer"
    ],
    "correctRoast": "Correct. Display lag is not the same as ownership loss.",
    "wrongRoast": "Wrong. Repeated self-sending is expensive alarm clock behavior.",
    "explanation": "Wallets and marketplaces may need time to index or refresh NFT metadata.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'My new Squig image is not showing yet. Does that mean I lost it?'",
        "correct": "Ownership check",
        "wrong": [
          "Token ran",
          "Gas refunds",
          "Wake transfer"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'L'image de mon nouveau Squig ne s'affiche pas encore. Ça veut dire que je l'ai perdu ?'",
        "correct": "Vérifier propriété",
        "wrong": [
          "Token parti",
          "Remboursements gas",
          "Transfert réveil"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'La imagen de mi nuevo Squig aún no aparece. ¿Significa que lo perdí?'",
        "correct": "Revisar propiedad",
        "wrong": [
          "Token huyó",
          "Reembolsos gas",
          "Transferir despertar"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-013",
    "tier": 5,
    "category": "Delisting",
    "prompt": "InSquignito asks, 'If I list a Squig and change my mind, what should I do?'",
    "correct": "Cancel listing",
    "wrong": [
      "Delete image",
      "Discord yell",
      "Hide NFT"
    ],
    "correctRoast": "Correct. The listing order needs cancellation, not yelling.",
    "wrongRoast": "Wrong. Discord yelling is not recognized by validators.",
    "explanation": "Listings may remain active until cancelled according to marketplace rules.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If I list a Squig and change my mind, what should I do?'",
        "correct": "Cancel listing",
        "wrong": [
          "Delete image",
          "Discord yell",
          "Hide NFT"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si je liste un Squig puis change d'avis, que faire ?'",
        "correct": "Annuler listing",
        "wrong": [
          "Supprimer image",
          "Crier Discord",
          "Cacher NFT"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si listo un Squig y cambio de opinión, ¿qué hago?'",
        "correct": "Cancelar listing",
        "wrong": [
          "Borrar imagen",
          "Gritar Discord",
          "Ocultar NFT"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-014",
    "tier": 5,
    "category": "Wrapped Offers",
    "prompt": "InSquignito asks, 'Why can an old WETH offer still matter after I forget it exists?'",
    "correct": "Active offers",
    "wrong": [
      "Forget cancels",
      "WETH evaporates",
      "Ignored harmless"
    ],
    "correctRoast": "Correct. The chain does not honor forgetfulness as cancellation.",
    "wrongRoast": "Wrong. Forgetting is a human feature, not a contract function.",
    "explanation": "Users should monitor active offers, listings, and approvals because they can persist.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why can an old WETH offer still matter after I forget it exists?'",
        "correct": "Active offers",
        "wrong": [
          "Forget cancels",
          "WETH evaporates",
          "Ignored harmless"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi une vieille offre WETH peut encore compter après que je l'ai oubliée ?'",
        "correct": "Offres actives",
        "wrong": [
          "Oubli annule",
          "WETH évapore",
          "Ignoré inoffensif"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué una vieja oferta WETH aún importa después de olvidarla?'",
        "correct": "Ofertas activas",
        "wrong": [
          "Olvido cancela",
          "WETH evapora",
          "Ignorado inocuo"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-015",
    "tier": 5,
    "category": "Cross-Device Safety",
    "prompt": "InSquignito asks, 'Why be careful when connecting wallets on public or shared devices?'",
    "correct": "Shared risk",
    "wrong": [
      "Vibes protect",
      "Invisible wallets",
      "Auto forget"
    ],
    "correctRoast": "Correct. Shared device equals suspicious desk with fingerprints.",
    "wrongRoast": "Wrong. Vibes have no antivirus license.",
    "explanation": "Using wallets on shared devices increases privacy and security risk.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why be careful when connecting wallets on public or shared devices?'",
        "correct": "Shared risk",
        "wrong": [
          "Vibes protect",
          "Invisible wallets",
          "Auto forget"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi être prudent en connectant des wallets sur des appareils publics ou partagés ?'",
        "correct": "Risque partagé",
        "wrong": [
          "Vibes protègent",
          "Wallets invisibles",
          "Oubli auto"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué tener cuidado al conectar wallets en dispositivos públicos o compartidos?'",
        "correct": "Riesgo compartido",
        "wrong": [
          "Vibras protegen",
          "Wallets invisibles",
          "Olvido auto"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-016",
    "tier": 5,
    "category": "Recovery Reality",
    "prompt": "InSquignito asks, 'If I lose my seed phrase and my device dies, what happens?'",
    "correct": "Secure backup",
    "wrong": [
      "Vibe recovery",
      "Sadness email",
      "Mod restore"
    ],
    "correctRoast": "Correct. Backup or heartbreak. The chain is not a therapist.",
    "wrongRoast": "Wrong. Sadness review is still pending since 2017.",
    "explanation": "Self-custody requires secure backup because there may be no central recovery option.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'If I lose my seed phrase and my device dies, what happens?'",
        "correct": "Secure backup",
        "wrong": [
          "Vibe recovery",
          "Sadness email",
          "Mod restore"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Si je perds ma phrase seed et que mon appareil meurt, que se passe-t-il ?'",
        "correct": "Sauvegarde sûre",
        "wrong": [
          "Récup vibes",
          "Email tristesse",
          "Mod restaure"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Si pierdo mi frase semilla y muere mi dispositivo, ¿qué pasa?'",
        "correct": "Respaldo seguro",
        "wrong": [
          "Recuperación vibes",
          "Correo tristeza",
          "Mod restaura"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-017",
    "tier": 5,
    "category": "Portfolio Privacy",
    "prompt": "InSquignito asks, 'Why might someone use separate wallets for public identity and vault storage?'",
    "correct": "Wallet separation",
    "wrong": [
      "Wallet jealousy",
      "Gas points",
      "No NFTs"
    ],
    "correctRoast": "Correct. Separation keeps the stage wallet away from the basement vault.",
    "wrongRoast": "Wrong. Wallet jealousy remains unproven and extremely dramatic.",
    "explanation": "Blockchain activity is public, so wallet separation can help manage privacy and exposure.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'Why might someone use separate wallets for public identity and vault storage?'",
        "correct": "Wallet separation",
        "wrong": [
          "Wallet jealousy",
          "Gas points",
          "No NFTs"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Pourquoi utiliser des wallets séparés pour identité publique et stockage coffre ?'",
        "correct": "Séparer wallets",
        "wrong": [
          "Jalousie wallet",
          "Points gas",
          "Aucun NFT"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Por qué usar wallets separados para identidad pública y bóveda?'",
        "correct": "Separar wallets",
        "wrong": [
          "Celos wallet",
          "Puntos gas",
          "Sin NFT"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-018",
    "tier": 5,
    "category": "Educational Not Financial",
    "prompt": "InSquignito asks, 'What is this whole Squig onboarding interview not allowed to pretend?'",
    "correct": "Education only",
    "wrong": [
      "Moon ladder",
      "Ugly shield",
      "Vibe advisor"
    ],
    "correctRoast": "Correct. Education, not moon prophecy.",
    "wrongRoast": "Wrong. Ugly art is culture, not a risk shield.",
    "explanation": "Games can teach concepts, but users still need their own judgment and should not treat content as financial advice.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What is this whole Squig onboarding interview not allowed to pretend?'",
        "correct": "Education only",
        "wrong": [
          "Moon ladder",
          "Ugly shield",
          "Vibe advisor"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Tout cet entretien d'onboarding Squig ne doit pas prétendre être quoi ?'",
        "correct": "Éducation seule",
        "wrong": [
          "Échelle lune",
          "Bouclier laid",
          "Conseiller vibes"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué no debe fingir ser toda esta entrevista de onboarding Squig?'",
        "correct": "Solo educación",
        "wrong": [
          "Escalera luna",
          "Escudo feo",
          "Asesor vibes"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-019",
    "tier": 5,
    "category": "Buyer's Final Breath",
    "prompt": "InSquignito asks, 'What should I do in the final ten seconds before confirming a Squig purchase?'",
    "correct": "Pause verify",
    "wrong": [
      "FOMO drives",
      "Click fast",
      "Fees imaginary"
    ],
    "correctRoast": "Correct. Pause is the ugliest superpower.",
    "wrongRoast": "Wrong. FOMO's tiny hands keep crashing into confirm.",
    "explanation": "A final pause can prevent mistakes caused by urgency, hype, or confusion.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'What should I do in the final ten seconds before confirming a Squig purchase?'",
        "correct": "Pause verify",
        "wrong": [
          "FOMO drives",
          "Click fast",
          "Fees imaginary"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Que faire dans les dix dernières secondes avant de confirmer un achat Squig ?'",
        "correct": "Pause vérifier",
        "wrong": [
          "FOMO conduit",
          "Cliquer vite",
          "Frais imaginaires"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: '¿Qué hago en los últimos diez segundos antes de confirmar una compra Squig?'",
        "correct": "Pausar verificar",
        "wrong": [
          "FOMO conduce",
          "Clic rápido",
          "Tarifas imaginarias"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-020",
    "tier": 5,
    "category": "Graduation",
    "prompt": "InSquignito asks, 'After all this, what does buying a Squig friend responsibly mean?'",
    "correct": "Responsible buying",
    "wrong": [
      "Scam immunity",
      "Fee button",
      "Loud timeline"
    ],
    "correctRoast": "Correct. InSquignito is now ugly enough to read the wallet prompt.",
    "wrongRoast": "Wrong. Scam immunity does not unlock at graduation. Keep your helmet on.",
    "explanation": "Responsible NFT onboarding is a process of learning, verification, security, and risk management.",
    "i18n": {
      "en": {
        "prompt": "InSquignito asks, 'After all this, what does buying a Squig friend responsibly mean?'",
        "correct": "Responsible buying",
        "wrong": [
          "Scam immunity",
          "Fee button",
          "Loud timeline"
        ]
      },
      "fr": {
        "prompt": "InSquignito demande : 'Après tout ça, acheter un ami Squig de façon responsable veut dire quoi ?'",
        "correct": "Achat responsable",
        "wrong": [
          "Immunité scams",
          "Bouton frais",
          "Timeline forte"
        ]
      },
      "es": {
        "prompt": "InSquignito pregunta: 'Después de todo esto, ¿qué significa comprar un amigo Squig responsablemente?'",
        "correct": "Compra responsable",
        "wrong": [
          "Inmunidad scams",
          "Botón tarifas",
          "Timeline ruidosa"
        ]
      }
    }
  }
]`);

const QUESTIONS = RAW_QUESTIONS.map(q);

function answerWordCount(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/u).length;
}

function normalizeAnswerLabel(value) {
  return String(value || "").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

function validateQuestions(questions = QUESTIONS) {
  const ids = new Set();
  const counts = new Map();
  const correctPositions = new Set();
  const errors = [];

  for (const question of questions) {
    if (!question.id || ids.has(question.id)) errors.push(`Duplicate or missing question id: ${question.id}`);
    ids.add(question.id);
    counts.set(question.tier, (counts.get(question.tier) || 0) + 1);
    correctPositions.add(question.correctOptionId);
    if (!question.prompt?.en) errors.push(`${question.id} is missing prompt`);
    if (!question.correctRoast || !question.wrongRoast) errors.push(`${question.id} is missing roasts`);
    if (!Number.isFinite(question.reward) || question.reward <= 0) errors.push(`${question.id} has invalid reward`);
    if (!Array.isArray(question.options) || !question.options.some((option) => option.id === question.correctOptionId)) {
      errors.push(`${question.id} correct option is missing`);
    }
    if (!question.i18n || typeof question.i18n !== "object") {
      errors.push(`${question.id} is missing i18n`);
    } else {
      for (const language of SUPPORTED_QUESTION_LANGUAGES) {
        const localized = question.i18n[language];
        if (!localized) {
          errors.push(`${question.id} is missing i18n.${language}`);
          continue;
        }
        if (!String(localized.prompt || "").trim()) errors.push(`${question.id} i18n.${language}.prompt is missing`);
        if (!String(localized.correct || "").trim()) errors.push(`${question.id} i18n.${language}.correct is missing`);
        if (!Array.isArray(localized.wrong)) {
          errors.push(`${question.id} i18n.${language}.wrong must be an array`);
          continue;
        }
        if (localized.wrong.length !== question.wrong.length) {
          errors.push(`${question.id} i18n.${language}.wrong must have ${question.wrong.length} entries`);
        }

        const labels = [localized.correct, ...localized.wrong];
        for (const label of labels) {
          const wordCount = answerWordCount(label);
          if (wordCount < 1 || wordCount > 2) {
            errors.push(`${question.id} i18n.${language} answer "${label}" must be 1 or 2 words`);
          }
        }

        const correctLabel = normalizeAnswerLabel(localized.correct);
        const wrongLabels = localized.wrong.map(normalizeAnswerLabel);
        if (wrongLabels.includes(correctLabel)) {
          errors.push(`${question.id} i18n.${language} duplicates the correct answer in wrong answers`);
        }
        if (new Set(wrongLabels).size !== wrongLabels.length) {
          errors.push(`${question.id} i18n.${language} has duplicate wrong answers`);
        }
      }
    }
    const optionCount = question.options?.length || 0;
    if (question.tier === 1 && optionCount !== 2) errors.push(`${question.id} tier 1 must have 2 options`);
    if (question.tier === 2 && optionCount !== 3) errors.push(`${question.id} tier 2 must have 3 options`);
    if (question.tier === 3 && optionCount !== 3) errors.push(`${question.id} tier 3 must have 3 options`);
    if (question.tier >= 4 && optionCount !== 4) errors.push(`${question.id} tier ${question.tier} must have 4 options`);
  }

  for (let tier = 1; tier <= 5; tier += 1) {
    if ((counts.get(tier) || 0) !== 20) errors.push(`Tier ${tier} must have exactly 20 questions`);
  }

  if (questions.length !== 100) errors.push(`Expected 100 questions, found ${questions.length}`);
  if (correctPositions.size < 2) errors.push("Correct options must not all use the same option id");

  if (errors.length) {
    const error = new Error(`Interview question validation failed:\n${errors.join("\n")}`);
    error.validationErrors = errors;
    throw error;
  }
  return true;
}

module.exports = {
  QUESTIONS,
  validateQuestions
};

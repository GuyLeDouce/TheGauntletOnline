const IDS = ["a", "b", "c", "d"];
const DIFFICULTY_BY_TIER = {
  1: "Easy",
  2: "Medium",
  3: "Hard",
  4: "Extreme Hard",
  5: "Almost Impossible"
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
    "category": "Fiat Basics",
    "prompt": "What do people usually start with before using a crypto on-ramp?",
    "correct": "Fiat",
    "wrong": [
      "Bank"
    ],
    "correctRoast": "Correct. Fiat survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Fiat money is government-issued currency, often used first before buying crypto.",
    "i18n": {
      "en": {
        "prompt": "What do people usually start with before using a crypto on-ramp?",
        "correct": "Fiat",
        "wrong": [
          "Bank"
        ]
      },
      "fr": {
        "prompt": "Avec quoi commence-t-on généralement avant d'utiliser une rampe crypto ?",
        "correct": "Fiat",
        "wrong": [
          "Banque"
        ]
      },
      "es": {
        "prompt": "¿Con qué suele empezar alguien antes de usar una rampa cripto?",
        "correct": "Fiat",
        "wrong": [
          "Banco"
        ]
      }
    }
  },
  {
    "id": "squig-easy-002",
    "tier": 1,
    "category": "Exchanges",
    "prompt": "Which service commonly turns regular money into crypto?",
    "correct": "Exchange",
    "wrong": [
      "Wallet"
    ],
    "correctRoast": "Correct. Exchange survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A centralized exchange is a common beginner on-ramp from fiat into crypto.",
    "i18n": {
      "en": {
        "prompt": "Which service commonly turns regular money into crypto?",
        "correct": "Exchange",
        "wrong": [
          "Wallet"
        ]
      },
      "fr": {
        "prompt": "Quel service transforme souvent l'argent classique en crypto ?",
        "correct": "Exchange",
        "wrong": [
          "Wallet"
        ]
      },
      "es": {
        "prompt": "¿Qué servicio suele convertir dinero normal en cripto?",
        "correct": "Exchange",
        "wrong": [
          "Wallet"
        ]
      }
    }
  },
  {
    "id": "squig-easy-003",
    "tier": 1,
    "category": "Ethereum",
    "prompt": "Which asset usually pays transaction fees on Ethereum?",
    "correct": "ETH",
    "wrong": [
      "WETH"
    ],
    "correctRoast": "Correct. ETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "ETH is used to pay Ethereum network fees and often NFT purchase prices.",
    "i18n": {
      "en": {
        "prompt": "Which asset usually pays transaction fees on Ethereum?",
        "correct": "ETH",
        "wrong": [
          "WETH"
        ]
      },
      "fr": {
        "prompt": "Quel actif paie généralement les frais de transaction sur Ethereum ?",
        "correct": "ETH",
        "wrong": [
          "WETH"
        ]
      },
      "es": {
        "prompt": "¿Qué activo suele pagar las tarifas de transacción en Ethereum?",
        "correct": "ETH",
        "wrong": [
          "WETH"
        ]
      }
    }
  },
  {
    "id": "squig-easy-004",
    "tier": 1,
    "category": "Wallets",
    "prompt": "What tool controls blockchain assets with keys?",
    "correct": "Wallet",
    "wrong": [
      "Account"
    ],
    "correctRoast": "Correct. Wallet survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A wallet manages keys and lets the holder control on-chain assets.",
    "i18n": {
      "en": {
        "prompt": "What tool controls blockchain assets with keys?",
        "correct": "Wallet",
        "wrong": [
          "Account"
        ]
      },
      "fr": {
        "prompt": "Quel outil contrôle les actifs blockchain avec des clés ?",
        "correct": "Wallet",
        "wrong": [
          "Compte"
        ]
      },
      "es": {
        "prompt": "¿Qué herramienta controla activos blockchain con llaves?",
        "correct": "Wallet",
        "wrong": [
          "Cuenta"
        ]
      }
    }
  },
  {
    "id": "squig-easy-005",
    "tier": 1,
    "category": "Secrets",
    "prompt": "Which wallet item must stay private forever?",
    "correct": "Seed",
    "wrong": [
      "Password"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A seed phrase can restore and control a wallet, so it should never be shared.",
    "i18n": {
      "en": {
        "prompt": "Which wallet item must stay private forever?",
        "correct": "Seed",
        "wrong": [
          "Password"
        ]
      },
      "fr": {
        "prompt": "Quel élément du wallet doit rester privé pour toujours ?",
        "correct": "Seed",
        "wrong": [
          "Passe"
        ]
      },
      "es": {
        "prompt": "¿Qué elemento del wallet debe quedar privado para siempre?",
        "correct": "Semilla",
        "wrong": [
          "Clave"
        ]
      }
    }
  },
  {
    "id": "squig-easy-006",
    "tier": 1,
    "category": "Addresses",
    "prompt": "Which wallet item can be shared to receive assets?",
    "correct": "Address",
    "wrong": [
      "Key"
    ],
    "correctRoast": "Correct. Address survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A public address can receive assets; private recovery secrets must stay hidden.",
    "i18n": {
      "en": {
        "prompt": "Which wallet item can be shared to receive assets?",
        "correct": "Address",
        "wrong": [
          "Key"
        ]
      },
      "fr": {
        "prompt": "Quel élément du wallet peut être partagé pour recevoir des actifs ?",
        "correct": "Adresse",
        "wrong": [
          "Clé"
        ]
      },
      "es": {
        "prompt": "¿Qué elemento del wallet puede compartirse para recibir activos?",
        "correct": "Dirección",
        "wrong": [
          "Llave"
        ]
      }
    }
  },
  {
    "id": "squig-easy-007",
    "tier": 1,
    "category": "Fees",
    "prompt": "What pays validators to process an Ethereum transaction?",
    "correct": "Gas",
    "wrong": [
      "Tip"
    ],
    "correctRoast": "Correct. Gas survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Gas is the network fee paid to process activity on Ethereum.",
    "i18n": {
      "en": {
        "prompt": "What pays validators to process an Ethereum transaction?",
        "correct": "Gas",
        "wrong": [
          "Tip"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui paie les validateurs pour traiter une transaction Ethereum ?",
        "correct": "Gas",
        "wrong": [
          "Pourboire"
        ]
      },
      "es": {
        "prompt": "¿Qué paga a validadores por procesar una transacción de Ethereum?",
        "correct": "Gas",
        "wrong": [
          "Propina"
        ]
      }
    }
  },
  {
    "id": "squig-easy-008",
    "tier": 1,
    "category": "Networks",
    "prompt": "Which Ethereum environment holds real assets and real fees?",
    "correct": "Mainnet",
    "wrong": [
      "Testnet"
    ],
    "correctRoast": "Correct. Mainnet survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Mainnet is the live network where real assets and fees exist.",
    "i18n": {
      "en": {
        "prompt": "Which Ethereum environment holds real assets and real fees?",
        "correct": "Mainnet",
        "wrong": [
          "Testnet"
        ]
      },
      "fr": {
        "prompt": "Quel environnement Ethereum contient de vrais actifs et de vrais frais ?",
        "correct": "Mainnet",
        "wrong": [
          "Testnet"
        ]
      },
      "es": {
        "prompt": "¿Qué entorno de Ethereum tiene activos y tarifas reales?",
        "correct": "Mainnet",
        "wrong": [
          "Testnet"
        ]
      }
    }
  },
  {
    "id": "squig-easy-009",
    "tier": 1,
    "category": "NFTs",
    "prompt": "What unique on-chain item can represent a collectible?",
    "correct": "NFT",
    "wrong": [
      "Coin"
    ],
    "correctRoast": "Correct. NFT survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "An NFT is a unique token that can represent ownership or access for a collectible.",
    "i18n": {
      "en": {
        "prompt": "What unique on-chain item can represent a collectible?",
        "correct": "NFT",
        "wrong": [
          "Coin"
        ]
      },
      "fr": {
        "prompt": "Quel élément unique on-chain peut représenter un collectible ?",
        "correct": "NFT",
        "wrong": [
          "Coin"
        ]
      },
      "es": {
        "prompt": "¿Qué elemento único on-chain puede representar un coleccionable?",
        "correct": "NFT",
        "wrong": [
          "Moneda"
        ]
      }
    }
  },
  {
    "id": "squig-easy-010",
    "tier": 1,
    "category": "Blockchain",
    "prompt": "What shared record stores verified transactions?",
    "correct": "Blockchain",
    "wrong": [
      "Database"
    ],
    "correctRoast": "Correct. Blockchain survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A blockchain is a shared ledger maintained and verified by a network.",
    "i18n": {
      "en": {
        "prompt": "What shared record stores verified transactions?",
        "correct": "Blockchain",
        "wrong": [
          "Database"
        ]
      },
      "fr": {
        "prompt": "Quel registre partagé stocke les transactions vérifiées ?",
        "correct": "Blockchain",
        "wrong": [
          "Database"
        ]
      },
      "es": {
        "prompt": "¿Qué registro compartido guarda transacciones verificadas?",
        "correct": "Blockchain",
        "wrong": [
          "Database"
        ]
      }
    }
  },
  {
    "id": "squig-easy-011",
    "tier": 1,
    "category": "Marketplaces",
    "prompt": "Where do buyers usually browse listed collectibles?",
    "correct": "Marketplace",
    "wrong": [
      "Exchange"
    ],
    "correctRoast": "Correct. Marketplace survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "NFT marketplaces show collections, listings, offers, and purchase flows.",
    "i18n": {
      "en": {
        "prompt": "Where do buyers usually browse listed collectibles?",
        "correct": "Marketplace",
        "wrong": [
          "Exchange"
        ]
      },
      "fr": {
        "prompt": "Où les acheteurs consultent-ils généralement les collectibles listés ?",
        "correct": "Marketplace",
        "wrong": [
          "Exchange"
        ]
      },
      "es": {
        "prompt": "¿Dónde suelen mirar los compradores coleccionables listados?",
        "correct": "Marketplace",
        "wrong": [
          "Exchange"
        ]
      }
    }
  },
  {
    "id": "squig-easy-012",
    "tier": 1,
    "category": "Listings",
    "prompt": "What marketplace record shows an item is being sold?",
    "correct": "Listing",
    "wrong": [
      "Offer"
    ],
    "correctRoast": "Correct. Contract survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A listing is the marketplace sale record for an item offered at a price.",
    "i18n": {
      "en": {
        "prompt": "What marketplace record shows an item is being sold?",
        "correct": "Listing",
        "wrong": [
          "Offer"
        ]
      },
      "fr": {
        "prompt": "Quel enregistrement marketplace montre qu'un item est en vente ?",
        "correct": "Listing",
        "wrong": [
          "Offre"
        ]
      },
      "es": {
        "prompt": "¿Qué registro de marketplace muestra que un ítem está en venta?",
        "correct": "Listing",
        "wrong": [
          "Oferta"
        ]
      }
    }
  },
  {
    "id": "squig-easy-013",
    "tier": 1,
    "category": "Learning",
    "prompt": "What should happen before clicking a first crypto buy button?",
    "correct": "Learn",
    "wrong": [
      "Browse"
    ],
    "correctRoast": "Correct. Learn survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Beginners should understand wallets, fees, verification, and risk before buying.",
    "i18n": {
      "en": {
        "prompt": "What should happen before clicking a first crypto buy button?",
        "correct": "Learn",
        "wrong": [
          "Browse"
        ]
      },
      "fr": {
        "prompt": "Que faut-il faire avant le premier clic d'achat crypto ?",
        "correct": "Apprendre",
        "wrong": [
          "Parcourir"
        ]
      },
      "es": {
        "prompt": "¿Qué debería pasar antes del primer clic de compra cripto?",
        "correct": "Aprender",
        "wrong": [
          "Navegar"
        ]
      }
    }
  },
  {
    "id": "squig-easy-014",
    "tier": 1,
    "category": "Transfers",
    "prompt": "Which chain selection must match before sending funds away from an exchange?",
    "correct": "Network",
    "wrong": [
      "Address"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The destination network must match what the wallet and app support.",
    "i18n": {
      "en": {
        "prompt": "Which chain selection must match before sending funds away from an exchange?",
        "correct": "Network",
        "wrong": [
          "Address"
        ]
      },
      "fr": {
        "prompt": "Quelle sélection de chaîne doit correspondre avant un retrait depuis un exchange ?",
        "correct": "Réseau",
        "wrong": [
          "Adresse"
        ]
      },
      "es": {
        "prompt": "¿Qué selección de cadena debe coincidir antes de retirar desde un exchange?",
        "correct": "Red",
        "wrong": [
          "Dirección"
        ]
      }
    }
  },
  {
    "id": "squig-easy-015",
    "tier": 1,
    "category": "Explorers",
    "prompt": "Where can public transaction status be inspected?",
    "correct": "Explorer",
    "wrong": [
      "Wallet"
    ],
    "correctRoast": "Correct. Explorer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A block explorer lets anyone inspect public blockchain data.",
    "i18n": {
      "en": {
        "prompt": "Where can public transaction status be inspected?",
        "correct": "Explorer",
        "wrong": [
          "Wallet"
        ]
      },
      "fr": {
        "prompt": "Où peut-on inspecter le statut public d'une transaction ?",
        "correct": "Explorer",
        "wrong": [
          "Wallet"
        ]
      },
      "es": {
        "prompt": "¿Dónde se puede inspeccionar el estado público de una transacción?",
        "correct": "Explorer",
        "wrong": [
          "Wallet"
        ]
      }
    }
  },
  {
    "id": "squig-easy-016",
    "tier": 1,
    "category": "Signatures",
    "prompt": "What may prove wallet control without sending tokens?",
    "correct": "Signature",
    "wrong": [
      "Approval"
    ],
    "correctRoast": "Correct. Signature survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Some signatures prove wallet control, but users still need to read what they sign.",
    "i18n": {
      "en": {
        "prompt": "What may prove wallet control without sending tokens?",
        "correct": "Signature",
        "wrong": [
          "Approval"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut prouver le contrôle d'un wallet sans envoyer de tokens ?",
        "correct": "Signature",
        "wrong": [
          "Approbation"
        ]
      },
      "es": {
        "prompt": "¿Qué puede probar control del wallet sin enviar tokens?",
        "correct": "Firma",
        "wrong": [
          "Aprobación"
        ]
      }
    }
  },
  {
    "id": "squig-easy-017",
    "tier": 1,
    "category": "Wallet Prompts",
    "prompt": "What should be read before confirming a wallet action?",
    "correct": "Prompt",
    "wrong": [
      "Transaction"
    ],
    "correctRoast": "Correct. Prompt survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wallet prompts describe the action or permission being requested.",
    "i18n": {
      "en": {
        "prompt": "What should be read before confirming a wallet action?",
        "correct": "Prompt",
        "wrong": [
          "Transaction"
        ]
      },
      "fr": {
        "prompt": "Que faut-il lire avant de confirmer une action wallet ?",
        "correct": "Popup",
        "wrong": [
          "Transaction"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe leer antes de confirmar una acción del wallet?",
        "correct": "Popup",
        "wrong": [
          "Transacción"
        ]
      }
    }
  },
  {
    "id": "squig-easy-018",
    "tier": 1,
    "category": "Names",
    "prompt": "What can map a readable name to a wallet destination?",
    "correct": "ENS",
    "wrong": [
      "DNS"
    ],
    "correctRoast": "Correct. ENS survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Name services can resolve readable names to wallet addresses, but the result should be checked.",
    "i18n": {
      "en": {
        "prompt": "What can map a readable name to a wallet destination?",
        "correct": "ENS",
        "wrong": [
          "DNS"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut lier un nom lisible à une destination wallet ?",
        "correct": "ENS",
        "wrong": [
          "DNS"
        ]
      },
      "es": {
        "prompt": "¿Qué puede vincular un nombre legible con un destino wallet?",
        "correct": "ENS",
        "wrong": [
          "DNS"
        ]
      }
    }
  },
  {
    "id": "squig-easy-019",
    "tier": 1,
    "category": "Ownership",
    "prompt": "What proves a wallet owns a specific collectible?",
    "correct": "Token",
    "wrong": [
      "Metadata"
    ],
    "correctRoast": "Correct. Token survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "On-chain token ownership is the ownership record; screenshots are not proof.",
    "i18n": {
      "en": {
        "prompt": "What proves a wallet owns a specific collectible?",
        "correct": "Token",
        "wrong": [
          "Metadata"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui prouve qu'un wallet possède un collectible précis ?",
        "correct": "Token",
        "wrong": [
          "Métadonnées"
        ]
      },
      "es": {
        "prompt": "¿Qué prueba que un wallet posee un coleccionable específico?",
        "correct": "Token",
        "wrong": [
          "Metadatos"
        ]
      }
    }
  },
  {
    "id": "squig-easy-020",
    "tier": 1,
    "category": "Mindset",
    "prompt": "What protects beginners from hype and ugly mistakes?",
    "correct": "Caution",
    "wrong": [
      "Confidence"
    ],
    "correctRoast": "Correct. Caution survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A careful pace beats rushed clicks, hype, and scam pressure.",
    "i18n": {
      "en": {
        "prompt": "What protects beginners from hype and ugly mistakes?",
        "correct": "Caution",
        "wrong": [
          "Confidence"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui protège les débutants du hype et des erreurs laides ?",
        "correct": "Prudence",
        "wrong": [
          "Confiance"
        ]
      },
      "es": {
        "prompt": "¿Qué protege a principiantes del hype y errores feos?",
        "correct": "Cautela",
        "wrong": [
          "Confianza"
        ]
      }
    }
  },
  {
    "id": "squig-certified-001",
    "tier": 2,
    "category": "Exchange Security",
    "prompt": "Which extra login layer should protect an exchange account?",
    "correct": "2FA",
    "wrong": [
      "Password",
      "Email"
    ],
    "correctRoast": "Correct. 2FA survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Two-factor authentication helps protect exchange accounts from password-only failure.",
    "i18n": {
      "en": {
        "prompt": "Which extra login layer should protect an exchange account?",
        "correct": "2FA",
        "wrong": [
          "Password",
          "Email"
        ]
      },
      "fr": {
        "prompt": "Quelle couche de connexion supplémentaire doit protéger un compte exchange ?",
        "correct": "2FA",
        "wrong": [
          "Passe",
          "Email"
        ]
      },
      "es": {
        "prompt": "¿Qué capa extra de inicio debe proteger una cuenta de exchange?",
        "correct": "2FA",
        "wrong": [
          "Clave",
          "Email"
        ]
      }
    }
  },
  {
    "id": "squig-certified-002",
    "tier": 2,
    "category": "Compliance",
    "prompt": "What identity check may a regulated exchange require?",
    "correct": "KYC",
    "wrong": [
      "AML",
      "Captcha"
    ],
    "correctRoast": "Correct. KYC survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Many centralized exchanges require identity checks before deposits, trades, or withdrawals.",
    "i18n": {
      "en": {
        "prompt": "What identity check may a regulated exchange require?",
        "correct": "KYC",
        "wrong": [
          "AML",
          "Captcha"
        ]
      },
      "fr": {
        "prompt": "Quel contrôle d'identité un exchange régulé peut-il demander ?",
        "correct": "KYC",
        "wrong": [
          "AML",
          "Captcha"
        ]
      },
      "es": {
        "prompt": "¿Qué verificación de identidad puede pedir un exchange regulado?",
        "correct": "KYC",
        "wrong": [
          "AML",
          "Captcha"
        ]
      }
    }
  },
  {
    "id": "squig-certified-003",
    "tier": 2,
    "category": "Deposits",
    "prompt": "What cost should be checked before depositing regular money?",
    "correct": "Fees",
    "wrong": [
      "Limits",
      "Holds"
    ],
    "correctRoast": "Correct. Fees survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Deposit methods, fees, limits, and holds can affect the final amount and timing.",
    "i18n": {
      "en": {
        "prompt": "What cost should be checked before depositing regular money?",
        "correct": "Fees",
        "wrong": [
          "Limits",
          "Holds"
        ]
      },
      "fr": {
        "prompt": "Quel coût faut-il vérifier avant de déposer de l'argent classique ?",
        "correct": "Frais",
        "wrong": [
          "Limites",
          "Blocages"
        ]
      },
      "es": {
        "prompt": "¿Qué coste conviene revisar antes de depositar dinero normal?",
        "correct": "Tarifas",
        "wrong": [
          "Límites",
          "Retenciones"
        ]
      }
    }
  },
  {
    "id": "squig-certified-004",
    "tier": 2,
    "category": "Buying Crypto",
    "prompt": "Which balance is normally needed for Ethereum collectible shopping?",
    "correct": "ETH",
    "wrong": [
      "WETH",
      "USDC"
    ],
    "correctRoast": "Correct. ETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Ethereum NFT purchases usually require ETH for the price and gas.",
    "i18n": {
      "en": {
        "prompt": "Which balance is normally needed for Ethereum collectible shopping?",
        "correct": "ETH",
        "wrong": [
          "WETH",
          "USDC"
        ]
      },
      "fr": {
        "prompt": "Quel solde faut-il généralement pour acheter des collectibles Ethereum ?",
        "correct": "ETH",
        "wrong": [
          "WETH",
          "USDC"
        ]
      },
      "es": {
        "prompt": "¿Qué saldo suele hacer falta para comprar coleccionables Ethereum?",
        "correct": "ETH",
        "wrong": [
          "WETH",
          "USDC"
        ]
      }
    }
  },
  {
    "id": "squig-certified-005",
    "tier": 2,
    "category": "Withdrawals",
    "prompt": "Which destination string should be checked before withdrawing?",
    "correct": "Address",
    "wrong": [
      "Network",
      "ENS"
    ],
    "correctRoast": "Correct. Address survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Crypto transfers are hard to reverse, so the destination must be checked carefully.",
    "i18n": {
      "en": {
        "prompt": "Which destination string should be checked before withdrawing?",
        "correct": "Address",
        "wrong": [
          "Network",
          "ENS"
        ]
      },
      "fr": {
        "prompt": "Quelle chaîne de destination faut-il vérifier avant un retrait ?",
        "correct": "Adresse",
        "wrong": [
          "Réseau",
          "ENS"
        ]
      },
      "es": {
        "prompt": "¿Qué cadena de destino debe revisarse antes de retirar?",
        "correct": "Dirección",
        "wrong": [
          "Red",
          "ENS"
        ]
      }
    }
  },
  {
    "id": "squig-certified-006",
    "tier": 2,
    "category": "Network Choice",
    "prompt": "Which withdrawal choice must match the destination wallet and app?",
    "correct": "Network",
    "wrong": [
      "Wallet",
      "Asset"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wrong-network transfers can make funds hard or impossible to access.",
    "i18n": {
      "en": {
        "prompt": "Which withdrawal choice must match the destination wallet and app?",
        "correct": "Network",
        "wrong": [
          "Wallet",
          "Asset"
        ]
      },
      "fr": {
        "prompt": "Quel choix de retrait doit correspondre au wallet et à l'app destination ?",
        "correct": "Réseau",
        "wrong": [
          "Wallet",
          "Actif"
        ]
      },
      "es": {
        "prompt": "¿Qué opción de retiro debe coincidir con el wallet y la app destino?",
        "correct": "Red",
        "wrong": [
          "Wallet",
          "Activo"
        ]
      }
    }
  },
  {
    "id": "squig-certified-007",
    "tier": 2,
    "category": "Test Transfers",
    "prompt": "What reduces risk before sending a large amount?",
    "correct": "Test",
    "wrong": [
      "Estimate",
      "Preview"
    ],
    "correctRoast": "Correct. Test survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A small test transfer can confirm the address and network before moving more value.",
    "i18n": {
      "en": {
        "prompt": "What reduces risk before sending a large amount?",
        "correct": "Test",
        "wrong": [
          "Estimate",
          "Preview"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui réduit le risque avant d'envoyer un gros montant ?",
        "correct": "Test",
        "wrong": [
          "Estimation",
          "Aperçu"
        ]
      },
      "es": {
        "prompt": "¿Qué reduce el riesgo antes de enviar una cantidad grande?",
        "correct": "Prueba",
        "wrong": [
          "Estimación",
          "Vista"
        ]
      }
    }
  },
  {
    "id": "squig-certified-008",
    "tier": 2,
    "category": "Backups",
    "prompt": "What should be stored offline during wallet setup?",
    "correct": "Backup",
    "wrong": [
      "Password",
      "Device"
    ],
    "correctRoast": "Correct. Backup survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Secure offline backups help prevent permanent wallet loss.",
    "i18n": {
      "en": {
        "prompt": "What should be stored offline during wallet setup?",
        "correct": "Backup",
        "wrong": [
          "Password",
          "Device"
        ]
      },
      "fr": {
        "prompt": "Que faut-il garder offline pendant la configuration du wallet ?",
        "correct": "Sauvegarde",
        "wrong": [
          "Passe",
          "Appareil"
        ]
      },
      "es": {
        "prompt": "¿Qué debe guardarse offline al configurar el wallet?",
        "correct": "Respaldo",
        "wrong": [
          "Clave",
          "Dispositivo"
        ]
      }
    }
  },
  {
    "id": "squig-certified-009",
    "tier": 2,
    "category": "Secret Storage",
    "prompt": "Which recovery phrase should never be saved in cloud screenshots?",
    "correct": "Seed",
    "wrong": [
      "Password",
      "Address"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Cloud screenshots can leak recovery secrets to attackers.",
    "i18n": {
      "en": {
        "prompt": "Which recovery phrase should never be saved in cloud screenshots?",
        "correct": "Seed",
        "wrong": [
          "Password",
          "Address"
        ]
      },
      "fr": {
        "prompt": "Quelle phrase de récupération ne doit jamais être sauvegardée en capture cloud ?",
        "correct": "Seed",
        "wrong": [
          "Passe",
          "Adresse"
        ]
      },
      "es": {
        "prompt": "¿Qué frase de recuperación nunca debe guardarse en capturas cloud?",
        "correct": "Semilla",
        "wrong": [
          "Clave",
          "Dirección"
        ]
      }
    }
  },
  {
    "id": "squig-certified-010",
    "tier": 2,
    "category": "Custody",
    "prompt": "What describes assets held by a company account?",
    "correct": "Custody",
    "wrong": [
      "Escrow",
      "Account"
    ],
    "correctRoast": "Correct. Custody survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Custodial platforms hold keys and credit users internally.",
    "i18n": {
      "en": {
        "prompt": "What describes assets held by a company account?",
        "correct": "Custody",
        "wrong": [
          "Escrow",
          "Account"
        ]
      },
      "fr": {
        "prompt": "Quel mot décrit des actifs gardés par un compte d'entreprise ?",
        "correct": "Custodie",
        "wrong": [
          "Escrow",
          "Compte"
        ]
      },
      "es": {
        "prompt": "¿Qué describe activos guardados por una cuenta de empresa?",
        "correct": "Custodia",
        "wrong": [
          "Escrow",
          "Cuenta"
        ]
      }
    }
  },
  {
    "id": "squig-certified-011",
    "tier": 2,
    "category": "Self Control",
    "prompt": "What gives direct control after withdrawing from a platform?",
    "correct": "Wallet",
    "wrong": [
      "Custody",
      "Account"
    ],
    "correctRoast": "Correct. Wallet survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A self-custody wallet gives control and responsibility to the holder.",
    "i18n": {
      "en": {
        "prompt": "What gives direct control after withdrawing from a platform?",
        "correct": "Wallet",
        "wrong": [
          "Custody",
          "Account"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui donne un contrôle direct après retrait d'une plateforme ?",
        "correct": "Wallet",
        "wrong": [
          "Custodie",
          "Compte"
        ]
      },
      "es": {
        "prompt": "¿Qué da control directo tras retirar desde una plataforma?",
        "correct": "Wallet",
        "wrong": [
          "Custodia",
          "Cuenta"
        ]
      }
    }
  },
  {
    "id": "squig-certified-012",
    "tier": 2,
    "category": "Prices",
    "prompt": "Which headline quote shows purchase cost before extra charges?",
    "correct": "Price",
    "wrong": [
      "Spread",
      "Fee"
    ],
    "correctRoast": "Correct. Price survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Displayed quotes can vary by fee, spread, and payment method.",
    "i18n": {
      "en": {
        "prompt": "Which headline quote shows purchase cost before extra charges?",
        "correct": "Price",
        "wrong": [
          "Spread",
          "Fee"
        ]
      },
      "fr": {
        "prompt": "Quel devis principal montre le coût d'achat avant frais extras ?",
        "correct": "Prix",
        "wrong": [
          "Spread",
          "Frais"
        ]
      },
      "es": {
        "prompt": "¿Qué cotización principal muestra el coste antes de cargos extra?",
        "correct": "Precio",
        "wrong": [
          "Spread",
          "Tarifa"
        ]
      }
    }
  },
  {
    "id": "squig-certified-013",
    "tier": 2,
    "category": "Trading Costs",
    "prompt": "What hidden trading cost can reduce the received amount?",
    "correct": "Spread",
    "wrong": [
      "Fee",
      "Slippage"
    ],
    "correctRoast": "Correct. Spread survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A spread is the difference between quoted buy and sell prices.",
    "i18n": {
      "en": {
        "prompt": "What hidden trading cost can reduce the received amount?",
        "correct": "Spread",
        "wrong": [
          "Fee",
          "Slippage"
        ]
      },
      "fr": {
        "prompt": "Quel coût de trading caché peut réduire le montant reçu ?",
        "correct": "Spread",
        "wrong": [
          "Frais",
          "Slippage"
        ]
      },
      "es": {
        "prompt": "¿Qué coste oculto de trading puede reducir lo recibido?",
        "correct": "Spread",
        "wrong": [
          "Tarifa",
          "Slippage"
        ]
      }
    }
  },
  {
    "id": "squig-certified-014",
    "tier": 2,
    "category": "Readable Names",
    "prompt": "What must be verified when using a readable wallet name?",
    "correct": "Address",
    "wrong": [
      "Resolver",
      "ENS"
    ],
    "correctRoast": "Correct. Address survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Readable names are convenient, but the resolved destination should still be confirmed.",
    "i18n": {
      "en": {
        "prompt": "What must be verified when using a readable wallet name?",
        "correct": "Address",
        "wrong": [
          "Resolver",
          "ENS"
        ]
      },
      "fr": {
        "prompt": "Que faut-il vérifier avec un nom wallet lisible ?",
        "correct": "Adresse",
        "wrong": [
          "Resolver",
          "ENS"
        ]
      },
      "es": {
        "prompt": "¿Qué debe verificarse al usar un nombre legible de wallet?",
        "correct": "Dirección",
        "wrong": [
          "Resolver",
          "ENS"
        ]
      }
    }
  },
  {
    "id": "squig-certified-015",
    "tier": 2,
    "category": "Pending Transfers",
    "prompt": "What status means a transfer is not final yet?",
    "correct": "Pending",
    "wrong": [
      "Queued",
      "Confirmed"
    ],
    "correctRoast": "Correct. Pending survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Pending transactions may still be waiting for confirmation.",
    "i18n": {
      "en": {
        "prompt": "What status means a transfer is not final yet?",
        "correct": "Pending",
        "wrong": [
          "Queued",
          "Confirmed"
        ]
      },
      "fr": {
        "prompt": "Quel statut indique qu'un transfert n'est pas encore final ?",
        "correct": "Pending",
        "wrong": [
          "Queue",
          "Confirmé"
        ]
      },
      "es": {
        "prompt": "¿Qué estado indica que una transferencia aún no es final?",
        "correct": "Pendiente",
        "wrong": [
          "Cola",
          "Confirmado"
        ]
      }
    }
  },
  {
    "id": "squig-certified-016",
    "tier": 2,
    "category": "Support Scams",
    "prompt": "What should be avoided when support asks for secrets?",
    "correct": "Sharing",
    "wrong": [
      "Signing",
      "Clicking"
    ],
    "correctRoast": "Correct. Sharing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Legitimate support should not need a seed phrase or private key.",
    "i18n": {
      "en": {
        "prompt": "What should be avoided when support asks for secrets?",
        "correct": "Sharing",
        "wrong": [
          "Signing",
          "Clicking"
        ]
      },
      "fr": {
        "prompt": "Que faut-il éviter si le support demande des secrets ?",
        "correct": "Partager",
        "wrong": [
          "Signer",
          "Cliquer"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe evitar si soporte pide secretos?",
        "correct": "Compartir",
        "wrong": [
          "Firmar",
          "Clicar"
        ]
      }
    }
  },
  {
    "id": "squig-certified-017",
    "tier": 2,
    "category": "Official Links",
    "prompt": "What should official project links become?",
    "correct": "Bookmarks",
    "wrong": [
      "Search",
      "Ads"
    ],
    "correctRoast": "Correct. Bookmarks survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Bookmarks reduce the risk of phishing links from ads, DMs, and search results.",
    "i18n": {
      "en": {
        "prompt": "What should official project links become?",
        "correct": "Bookmarks",
        "wrong": [
          "Search",
          "Ads"
        ]
      },
      "fr": {
        "prompt": "Que devraient devenir les liens officiels du projet ?",
        "correct": "Favoris",
        "wrong": [
          "Recherche",
          "Pubs"
        ]
      },
      "es": {
        "prompt": "¿En qué deberían convertirse los enlaces oficiales del proyecto?",
        "correct": "Marcadores",
        "wrong": [
          "Búsqueda",
          "Anuncios"
        ]
      }
    }
  },
  {
    "id": "squig-certified-018",
    "tier": 2,
    "category": "DM Safety",
    "prompt": "What signal in messages should make a beginner slow down?",
    "correct": "Urgency",
    "wrong": [
      "Bonus",
      "Offer"
    ],
    "correctRoast": "Correct. Urgency survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Scammers often use urgency to push unsafe clicks and signatures.",
    "i18n": {
      "en": {
        "prompt": "What signal in messages should make a beginner slow down?",
        "correct": "Urgency",
        "wrong": [
          "Bonus",
          "Offer"
        ]
      },
      "fr": {
        "prompt": "Quel signal dans les messages doit faire ralentir un débutant ?",
        "correct": "Urgence",
        "wrong": [
          "Bonus",
          "Offre"
        ]
      },
      "es": {
        "prompt": "¿Qué señal en mensajes debería hacer frenar a un principiante?",
        "correct": "Urgencia",
        "wrong": [
          "Bono",
          "Oferta"
        ]
      }
    }
  },
  {
    "id": "squig-certified-019",
    "tier": 2,
    "category": "Risk",
    "prompt": "What should limit a beginner's first purchases?",
    "correct": "Budget",
    "wrong": [
      "Leverage",
      "Loan"
    ],
    "correctRoast": "Correct. Budget survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Only risk money that can be lost without damaging real life.",
    "i18n": {
      "en": {
        "prompt": "What should limit a beginner's first purchases?",
        "correct": "Budget",
        "wrong": [
          "Leverage",
          "Loan"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui doit limiter les premiers achats d'un débutant ?",
        "correct": "Budget",
        "wrong": [
          "Levier",
          "Prêt"
        ]
      },
      "es": {
        "prompt": "¿Qué debería limitar las primeras compras de un principiante?",
        "correct": "Presupuesto",
        "wrong": [
          "Apalancar",
          "Préstamo"
        ]
      }
    }
  },
  {
    "id": "squig-certified-020",
    "tier": 2,
    "category": "Preparation",
    "prompt": "What comes before shopping for collectibles?",
    "correct": "Security",
    "wrong": [
      "Funding",
      "Bidding"
    ],
    "correctRoast": "Correct. Security survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Basic wallet security should come before marketplace activity.",
    "i18n": {
      "en": {
        "prompt": "What comes before shopping for collectibles?",
        "correct": "Security",
        "wrong": [
          "Funding",
          "Bidding"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui vient avant d'acheter des collectibles ?",
        "correct": "Sécurité",
        "wrong": [
          "Financer",
          "Offrir"
        ]
      },
      "es": {
        "prompt": "¿Qué viene antes de comprar coleccionables?",
        "correct": "Seguridad",
        "wrong": [
          "Fondos",
          "Ofertar"
        ]
      }
    }
  },
  {
    "id": "squig-deep-001",
    "tier": 3,
    "category": "Marketplaces",
    "prompt": "Which named marketplace is this Squig buying path focused on?",
    "correct": "OpenSea",
    "wrong": [
      "Blur",
      "Rarible"
    ],
    "correctRoast": "Correct. OpenSea survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "OpenSea is a common marketplace for browsing and buying Ethereum NFTs.",
    "i18n": {
      "en": {
        "prompt": "Which named marketplace is this Squig buying path focused on?",
        "correct": "OpenSea",
        "wrong": [
          "Blur",
          "Rarible"
        ]
      },
      "fr": {
        "prompt": "Sur quelle marketplace nommée ce parcours d'achat Squig se concentre-t-il ?",
        "correct": "OpenSea",
        "wrong": [
          "Blur",
          "Rarible"
        ]
      },
      "es": {
        "prompt": "¿En qué marketplace nombrada se centra este camino para comprar Squigs?",
        "correct": "OpenSea",
        "wrong": [
          "Blur",
          "Rarible"
        ]
      }
    }
  },
  {
    "id": "squig-deep-002",
    "tier": 3,
    "category": "OpenSea Pages",
    "prompt": "Which OpenSea page type shows one NFT with price and buy actions?",
    "correct": "Item",
    "wrong": [
      "Profile",
      "Activity"
    ],
    "correctRoast": "Correct. Collection survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "An item page is where a buyer reviews a specific NFT, its sale details, and available actions.",
    "i18n": {
      "en": {
        "prompt": "Which OpenSea page type shows one NFT with price and buy actions?",
        "correct": "Item",
        "wrong": [
          "Profile",
          "Activity"
        ]
      },
      "fr": {
        "prompt": "Quel type de page OpenSea montre un NFT avec prix et actions d'achat ?",
        "correct": "Item",
        "wrong": [
          "Profil",
          "Activité"
        ]
      },
      "es": {
        "prompt": "¿Qué tipo de página de OpenSea muestra un NFT con precio y compra?",
        "correct": "Ítem",
        "wrong": [
          "Perfil",
          "Actividad"
        ]
      }
    }
  },
  {
    "id": "squig-deep-003",
    "tier": 3,
    "category": "Contracts",
    "prompt": "What on-chain code handles marketplace permissions and transfers?",
    "correct": "Contract",
    "wrong": [
      "Signature",
      "Listing"
    ],
    "correctRoast": "Correct. Contract survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Smart contracts handle rules such as approvals, transfers, and marketplace execution.",
    "i18n": {
      "en": {
        "prompt": "What on-chain code handles marketplace permissions and transfers?",
        "correct": "Contract",
        "wrong": [
          "Signature",
          "Listing"
        ]
      },
      "fr": {
        "prompt": "Quel code on-chain gère les permissions et transferts marketplace ?",
        "correct": "Contrat",
        "wrong": [
          "Signature",
          "Listing"
        ]
      },
      "es": {
        "prompt": "¿Qué código on-chain maneja permisos y transferencias de marketplace?",
        "correct": "Contrato",
        "wrong": [
          "Firma",
          "Listing"
        ]
      }
    }
  },
  {
    "id": "squig-deep-004",
    "tier": 3,
    "category": "Token IDs",
    "prompt": "What number identifies one item inside a collection contract?",
    "correct": "Token",
    "wrong": [
      "Listing",
      "Trait"
    ],
    "correctRoast": "Correct. Token survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A token ID identifies a specific NFT within its contract.",
    "i18n": {
      "en": {
        "prompt": "What number identifies one item inside a collection contract?",
        "correct": "Token",
        "wrong": [
          "Listing",
          "Trait"
        ]
      },
      "fr": {
        "prompt": "Quel numéro identifie un item dans un contrat de collection ?",
        "correct": "Token",
        "wrong": [
          "Listing",
          "Trait"
        ]
      },
      "es": {
        "prompt": "¿Qué número identifica un ítem dentro de un contrato de colección?",
        "correct": "Token",
        "wrong": [
          "Listing",
          "Rasgo"
        ]
      }
    }
  },
  {
    "id": "squig-deep-005",
    "tier": 3,
    "category": "Metadata",
    "prompt": "What data package stores media links and attributes?",
    "correct": "Metadata",
    "wrong": [
      "Trait",
      "URI"
    ],
    "correctRoast": "Correct. Metadata survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Metadata points to information such as image, name, description, and traits.",
    "i18n": {
      "en": {
        "prompt": "What data package stores media links and attributes?",
        "correct": "Metadata",
        "wrong": [
          "Trait",
          "URI"
        ]
      },
      "fr": {
        "prompt": "Quel paquet de données stocke les liens média et attributs ?",
        "correct": "Métadonnées",
        "wrong": [
          "Trait",
          "URI"
        ]
      },
      "es": {
        "prompt": "¿Qué paquete de datos guarda enlaces de medios y atributos?",
        "correct": "Metadatos",
        "wrong": [
          "Rasgo",
          "URI"
        ]
      }
    }
  },
  {
    "id": "squig-deep-006",
    "tier": 3,
    "category": "Traits",
    "prompt": "What visual properties can affect collector preference?",
    "correct": "Traits",
    "wrong": [
      "Metadata",
      "Rarity"
    ],
    "correctRoast": "Correct. Traits survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Traits can affect rarity and preference, but they do not guarantee value.",
    "i18n": {
      "en": {
        "prompt": "What visual properties can affect collector preference?",
        "correct": "Traits",
        "wrong": [
          "Metadata",
          "Rarity"
        ]
      },
      "fr": {
        "prompt": "Quelles propriétés visuelles peuvent influencer les préférences des collectionneurs ?",
        "correct": "Traits",
        "wrong": [
          "Métadonnées",
          "Rareté"
        ]
      },
      "es": {
        "prompt": "¿Qué propiedades visuales pueden influir en preferencias de coleccionistas?",
        "correct": "Rasgos",
        "wrong": [
          "Metadatos",
          "Rareza"
        ]
      }
    }
  },
  {
    "id": "squig-deep-007",
    "tier": 3,
    "category": "Floor Price",
    "prompt": "What means the lowest current listed price?",
    "correct": "Floor",
    "wrong": [
      "Ask",
      "Bid"
    ],
    "correctRoast": "Correct. Floor survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Floor price is a current listing snapshot, not a guaranteed sale price.",
    "i18n": {
      "en": {
        "prompt": "What means the lowest current listed price?",
        "correct": "Floor",
        "wrong": [
          "Ask",
          "Bid"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui signifie le prix listé le plus bas actuellement ?",
        "correct": "Floor",
        "wrong": [
          "Ask",
          "Bid"
        ]
      },
      "es": {
        "prompt": "¿Qué significa el precio listado más bajo actual?",
        "correct": "Floor",
        "wrong": [
          "Ask",
          "Bid"
        ]
      }
    }
  },
  {
    "id": "squig-deep-008",
    "tier": 3,
    "category": "Listings",
    "prompt": "What means an owner has offered an item for sale?",
    "correct": "Listing",
    "wrong": [
      "Offer",
      "Auction"
    ],
    "correctRoast": "Correct. Listing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A listing is a sale order that can remain active until filled or canceled.",
    "i18n": {
      "en": {
        "prompt": "What means an owner has offered an item for sale?",
        "correct": "Listing",
        "wrong": [
          "Offer",
          "Auction"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui signifie qu'un propriétaire propose un item à la vente ?",
        "correct": "Listing",
        "wrong": [
          "Offre",
          "Enchère"
        ]
      },
      "es": {
        "prompt": "¿Qué significa que un dueño ofrece un ítem en venta?",
        "correct": "Listing",
        "wrong": [
          "Oferta",
          "Subasta"
        ]
      }
    }
  },
  {
    "id": "squig-deep-009",
    "tier": 3,
    "category": "Offers",
    "prompt": "What is a buyer's bid on an item called?",
    "correct": "Offer",
    "wrong": [
      "Listing",
      "Auction"
    ],
    "correctRoast": "Correct. Offer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "An offer is a bid that the owner can accept or ignore.",
    "i18n": {
      "en": {
        "prompt": "What is a buyer's bid on an item called?",
        "correct": "Offer",
        "wrong": [
          "Listing",
          "Auction"
        ]
      },
      "fr": {
        "prompt": "Comment appelle-t-on l'enchère d'un acheteur sur un item ?",
        "correct": "Offre",
        "wrong": [
          "Listing",
          "Enchère"
        ]
      },
      "es": {
        "prompt": "¿Cómo se llama la puja de un comprador por un ítem?",
        "correct": "Oferta",
        "wrong": [
          "Listing",
          "Subasta"
        ]
      }
    }
  },
  {
    "id": "squig-deep-010",
    "tier": 3,
    "category": "Checkout",
    "prompt": "Which listing number should match the sale amount?",
    "correct": "Price",
    "wrong": [
      "Gas",
      "Floor"
    ],
    "correctRoast": "Correct. Price survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The price, fees, token, network, and action should match the buyer's intention.",
    "i18n": {
      "en": {
        "prompt": "Which listing number should match the sale amount?",
        "correct": "Price",
        "wrong": [
          "Gas",
          "Floor"
        ]
      },
      "fr": {
        "prompt": "Quel nombre du listing doit correspondre au montant de vente ?",
        "correct": "Prix",
        "wrong": [
          "Gas",
          "Floor"
        ]
      },
      "es": {
        "prompt": "¿Qué número del listing debe coincidir con el monto de venta?",
        "correct": "Precio",
        "wrong": [
          "Gas",
          "Floor"
        ]
      }
    }
  },
  {
    "id": "squig-deep-011",
    "tier": 3,
    "category": "Offer Currency",
    "prompt": "Which wrapped asset may be needed for bids?",
    "correct": "WETH",
    "wrong": [
      "ETH",
      "USDC"
    ],
    "correctRoast": "Correct. WETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Some marketplaces use WETH for offers because contracts can handle it as a token.",
    "i18n": {
      "en": {
        "prompt": "Which wrapped asset may be needed for bids?",
        "correct": "WETH",
        "wrong": [
          "ETH",
          "USDC"
        ]
      },
      "fr": {
        "prompt": "Quel actif emballé peut être nécessaire pour les offres ?",
        "correct": "WETH",
        "wrong": [
          "ETH",
          "USDC"
        ]
      },
      "es": {
        "prompt": "¿Qué activo envuelto puede hacer falta para ofertas?",
        "correct": "WETH",
        "wrong": [
          "ETH",
          "USDC"
        ]
      }
    }
  },
  {
    "id": "squig-deep-012",
    "tier": 3,
    "category": "Congestion",
    "prompt": "What can rise when network traffic gets heavy?",
    "correct": "Gas",
    "wrong": [
      "Gwei",
      "Tip"
    ],
    "correctRoast": "Correct. Gas survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Network congestion can make transaction fees more expensive.",
    "i18n": {
      "en": {
        "prompt": "What can rise when network traffic gets heavy?",
        "correct": "Gas",
        "wrong": [
          "Gwei",
          "Tip"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut augmenter quand le trafic réseau est fort ?",
        "correct": "Gas",
        "wrong": [
          "Gwei",
          "Pourboire"
        ]
      },
      "es": {
        "prompt": "¿Qué puede subir cuando el tráfico de red es alto?",
        "correct": "Gas",
        "wrong": [
          "Gwei",
          "Propina"
        ]
      }
    }
  },
  {
    "id": "squig-deep-013",
    "tier": 3,
    "category": "Impersonation",
    "prompt": "What scam behavior pretends to be trusted staff or support?",
    "correct": "Impersonation",
    "wrong": [
      "Migration",
      "Airdrop"
    ],
    "correctRoast": "Correct. Impersonation survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Impersonation scams pretend to be trusted people or support channels to push unsafe actions.",
    "i18n": {
      "en": {
        "prompt": "What scam behavior pretends to be trusted staff or support?",
        "correct": "Impersonation",
        "wrong": [
          "Migration",
          "Airdrop"
        ]
      },
      "fr": {
        "prompt": "Quel comportement d'arnaque prétend être du staff ou support fiable ?",
        "correct": "Usurpation",
        "wrong": [
          "Migration",
          "Airdrop"
        ]
      },
      "es": {
        "prompt": "¿Qué conducta de estafa finge ser staff o soporte confiable?",
        "correct": "Suplantación",
        "wrong": [
          "Migración",
          "Airdrop"
        ]
      }
    }
  },
  {
    "id": "squig-deep-014",
    "tier": 3,
    "category": "Airdrops",
    "prompt": "What should unknown wallet gifts trigger?",
    "correct": "Suspicion",
    "wrong": [
      "Curiosity",
      "Claim"
    ],
    "correctRoast": "Correct. Suspicion survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Unexpected NFTs can be spam or phishing bait.",
    "i18n": {
      "en": {
        "prompt": "What should unknown wallet gifts trigger?",
        "correct": "Suspicion",
        "wrong": [
          "Curiosity",
          "Claim"
        ]
      },
      "fr": {
        "prompt": "Que doivent déclencher des cadeaux inconnus dans un wallet ?",
        "correct": "Suspicion",
        "wrong": [
          "Curiosité",
          "Claim"
        ]
      },
      "es": {
        "prompt": "¿Qué deberían provocar regalos desconocidos en un wallet?",
        "correct": "Sospecha",
        "wrong": [
          "Curiosidad",
          "Claim"
        ]
      }
    }
  },
  {
    "id": "squig-deep-015",
    "tier": 3,
    "category": "Approvals",
    "prompt": "What permission lets a marketplace move an item during sale?",
    "correct": "Approval",
    "wrong": [
      "Signature",
      "Listing"
    ],
    "correctRoast": "Correct. Approval survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Approvals allow contracts to transfer assets under specific conditions.",
    "i18n": {
      "en": {
        "prompt": "What permission lets a marketplace move an item during sale?",
        "correct": "Approval",
        "wrong": [
          "Signature",
          "Listing"
        ]
      },
      "fr": {
        "prompt": "Quelle permission permet à une marketplace de déplacer un item pendant une vente ?",
        "correct": "Approbation",
        "wrong": [
          "Signature",
          "Listing"
        ]
      },
      "es": {
        "prompt": "¿Qué permiso deja que una marketplace mueva un ítem durante la venta?",
        "correct": "Aprobación",
        "wrong": [
          "Firma",
          "Listing"
        ]
      }
    }
  },
  {
    "id": "squig-deep-016",
    "tier": 3,
    "category": "Revokes",
    "prompt": "What removes an old marketplace permission?",
    "correct": "Revoke",
    "wrong": [
      "Cancel",
      "Disconnect"
    ],
    "correctRoast": "Correct. Revoke survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Revoking old approvals reduces permission exposure.",
    "i18n": {
      "en": {
        "prompt": "What removes an old marketplace permission?",
        "correct": "Revoke",
        "wrong": [
          "Cancel",
          "Disconnect"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui retire une ancienne permission de marketplace ?",
        "correct": "Révoquer",
        "wrong": [
          "Annuler",
          "Déconnecter"
        ]
      },
      "es": {
        "prompt": "¿Qué quita un permiso viejo de marketplace?",
        "correct": "Revocar",
        "wrong": [
          "Cancelar",
          "Desconectar"
        ]
      }
    }
  },
  {
    "id": "squig-deep-017",
    "tier": 3,
    "category": "Ownership Checks",
    "prompt": "What shows independent ownership data?",
    "correct": "Explorer",
    "wrong": [
      "Marketplace",
      "Wallet"
    ],
    "correctRoast": "Correct. Explorer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Block explorers show public ownership and transaction data.",
    "i18n": {
      "en": {
        "prompt": "What shows independent ownership data?",
        "correct": "Explorer",
        "wrong": [
          "Marketplace",
          "Wallet"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui montre des données de propriété indépendantes ?",
        "correct": "Explorer",
        "wrong": [
          "Marketplace",
          "Wallet"
        ]
      },
      "es": {
        "prompt": "¿Qué muestra datos independientes de propiedad?",
        "correct": "Explorer",
        "wrong": [
          "Marketplace",
          "Wallet"
        ]
      }
    }
  },
  {
    "id": "squig-deep-018",
    "tier": 3,
    "category": "Pending Buys",
    "prompt": "What should be avoided while a purchase is pending?",
    "correct": "Duplicates",
    "wrong": [
      "Refresh",
      "Speed"
    ],
    "correctRoast": "Correct. Duplicates survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Duplicate panic clicks can create extra transactions or confusion.",
    "i18n": {
      "en": {
        "prompt": "What should be avoided while a purchase is pending?",
        "correct": "Duplicates",
        "wrong": [
          "Refresh",
          "Speed"
        ]
      },
      "fr": {
        "prompt": "Que faut-il éviter pendant qu'un achat est pending ?",
        "correct": "Doublons",
        "wrong": [
          "Rafraîchir",
          "Vitesse"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe evitar mientras una compra está pendiente?",
        "correct": "Duplicados",
        "wrong": [
          "Refrescar",
          "Velocidad"
        ]
      }
    }
  },
  {
    "id": "squig-deep-019",
    "tier": 3,
    "category": "Display Delays",
    "prompt": "What can delay an image after purchase?",
    "correct": "Indexing",
    "wrong": [
      "Metadata",
      "Cache"
    ],
    "correctRoast": "Correct. Indexing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wallets and marketplaces may need time to index metadata.",
    "i18n": {
      "en": {
        "prompt": "What can delay an image after purchase?",
        "correct": "Indexing",
        "wrong": [
          "Metadata",
          "Cache"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut retarder une image après achat ?",
        "correct": "Indexation",
        "wrong": [
          "Métadonnées",
          "Cache"
        ]
      },
      "es": {
        "prompt": "¿Qué puede retrasar una imagen después de comprar?",
        "correct": "Indexación",
        "wrong": [
          "Metadatos",
          "Cache"
        ]
      }
    }
  },
  {
    "id": "squig-deep-020",
    "tier": 3,
    "category": "Confirmation",
    "prompt": "What should the overall final wallet action match?",
    "correct": "Intent",
    "wrong": [
      "Price",
      "Network"
    ],
    "correctRoast": "Correct. Intent survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The wallet prompt should match what the buyer intends to do.",
    "i18n": {
      "en": {
        "prompt": "What should the overall final wallet action match?",
        "correct": "Intent",
        "wrong": [
          "Price",
          "Network"
        ]
      },
      "fr": {
        "prompt": "À quoi l'action finale globale du wallet doit-elle correspondre ?",
        "correct": "Intention",
        "wrong": [
          "Prix",
          "Réseau"
        ]
      },
      "es": {
        "prompt": "¿Con qué debe coincidir la acción final global del wallet?",
        "correct": "Intención",
        "wrong": [
          "Precio",
          "Red"
        ]
      }
    }
  },
  {
    "id": "squig-internal-001",
    "tier": 4,
    "category": "Phishing",
    "prompt": "What attack copies real project pages?",
    "correct": "Phishing",
    "wrong": [
      "Spoofing",
      "Dusting",
      "Indexing"
    ],
    "correctRoast": "Correct. Phishing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Phishing pages imitate real sites to steal signatures, approvals, or secrets.",
    "i18n": {
      "en": {
        "prompt": "What attack copies real project pages?",
        "correct": "Phishing",
        "wrong": [
          "Spoofing",
          "Dusting",
          "Indexing"
        ]
      },
      "fr": {
        "prompt": "Quelle attaque copie les vraies pages d'un projet ?",
        "correct": "Phishing",
        "wrong": [
          "Spoofing",
          "Dusting",
          "Indexation"
        ]
      },
      "es": {
        "prompt": "¿Qué ataque copia páginas reales de un proyecto?",
        "correct": "Phishing",
        "wrong": [
          "Spoofing",
          "Dusting",
          "Indexación"
        ]
      }
    }
  },
  {
    "id": "squig-internal-002",
    "tier": 4,
    "category": "Signing",
    "prompt": "Which signing risk means approving data you cannot understand?",
    "correct": "Blind",
    "wrong": [
      "Batch",
      "Typed",
      "Public"
    ],
    "correctRoast": "Correct. Blind survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Blind signing can hide dangerous actions behind unreadable data.",
    "i18n": {
      "en": {
        "prompt": "Which signing risk means approving data you cannot understand?",
        "correct": "Blind",
        "wrong": [
          "Batch",
          "Typed",
          "Public"
        ]
      },
      "fr": {
        "prompt": "Quel risque de signature signifie approuver des données incomprises ?",
        "correct": "Aveugle",
        "wrong": [
          "Batch",
          "Typé",
          "Public"
        ]
      },
      "es": {
        "prompt": "¿Qué riesgo de firma significa aprobar datos que no entiendes?",
        "correct": "Ciega",
        "wrong": [
          "Batch",
          "Tipada",
          "Pública"
        ]
      }
    }
  },
  {
    "id": "squig-internal-003",
    "tier": 4,
    "category": "Hardware",
    "prompt": "What device type keeps private keys offline?",
    "correct": "Hardware",
    "wrong": [
      "Mobile",
      "Desktop",
      "Web"
    ],
    "correctRoast": "Correct. Hardware survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Hardware wallets isolate keys and require physical confirmation.",
    "i18n": {
      "en": {
        "prompt": "What device type keeps private keys offline?",
        "correct": "Hardware",
        "wrong": [
          "Mobile",
          "Desktop",
          "Web"
        ]
      },
      "fr": {
        "prompt": "Quel type d'appareil garde les clés privées offline ?",
        "correct": "Matériel",
        "wrong": [
          "Mobile",
          "Desktop",
          "Web"
        ]
      },
      "es": {
        "prompt": "¿Qué tipo de dispositivo mantiene llaves privadas offline?",
        "correct": "Hardware",
        "wrong": [
          "Móvil",
          "Desktop",
          "Web"
        ]
      }
    }
  },
  {
    "id": "squig-internal-004",
    "tier": 4,
    "category": "Burners",
    "prompt": "What kind of wallet tests risky sites with little value?",
    "correct": "Burner",
    "wrong": [
      "Hot",
      "Vault",
      "Main"
    ],
    "correctRoast": "Correct. Burner survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Burner wallets limit exposure when trying unfamiliar apps.",
    "i18n": {
      "en": {
        "prompt": "What kind of wallet tests risky sites with little value?",
        "correct": "Burner",
        "wrong": [
          "Hot",
          "Vault",
          "Main"
        ]
      },
      "fr": {
        "prompt": "Quel genre de wallet teste les sites risqués avec peu de valeur ?",
        "correct": "Burner",
        "wrong": [
          "Hot",
          "Coffre",
          "Principal"
        ]
      },
      "es": {
        "prompt": "¿Qué tipo de wallet prueba sitios riesgosos con poco valor?",
        "correct": "Burner",
        "wrong": [
          "Hot",
          "Bóveda",
          "Principal"
        ]
      }
    }
  },
  {
    "id": "squig-internal-005",
    "tier": 4,
    "category": "Vaults",
    "prompt": "Which wallet role stores valuables with minimal clicking?",
    "correct": "Vault",
    "wrong": [
      "Burner",
      "Hot",
      "Exchange"
    ],
    "correctRoast": "Correct. Vault survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Vault wallets should avoid routine risky interactions.",
    "i18n": {
      "en": {
        "prompt": "Which wallet role stores valuables with minimal clicking?",
        "correct": "Vault",
        "wrong": [
          "Burner",
          "Hot",
          "Exchange"
        ]
      },
      "fr": {
        "prompt": "Quel rôle de wallet garde les objets précieux avec peu de clics ?",
        "correct": "Coffre",
        "wrong": [
          "Burner",
          "Hot",
          "Exchange"
        ]
      },
      "es": {
        "prompt": "¿Qué rol de wallet guarda objetos valiosos con pocos clics?",
        "correct": "Bóveda",
        "wrong": [
          "Burner",
          "Hot",
          "Exchange"
        ]
      }
    }
  },
  {
    "id": "squig-internal-006",
    "tier": 4,
    "category": "Approval Scope",
    "prompt": "Which permission scope is most dangerous?",
    "correct": "Unlimited",
    "wrong": [
      "Limited",
      "Session",
      "Token"
    ],
    "correctRoast": "Correct. Unlimited survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Unlimited approvals can expose many assets if a contract is malicious or compromised.",
    "i18n": {
      "en": {
        "prompt": "Which permission scope is most dangerous?",
        "correct": "Unlimited",
        "wrong": [
          "Limited",
          "Session",
          "Token"
        ]
      },
      "fr": {
        "prompt": "Quelle portée de permission est la plus dangereuse ?",
        "correct": "Illimité",
        "wrong": [
          "Limité",
          "Session",
          "Token"
        ]
      },
      "es": {
        "prompt": "¿Qué alcance de permiso es más peligroso?",
        "correct": "Ilimitado",
        "wrong": [
          "Limitado",
          "Sesión",
          "Token"
        ]
      }
    }
  },
  {
    "id": "squig-internal-007",
    "tier": 4,
    "category": "Permission Hygiene",
    "prompt": "What should happen to old unused permissions?",
    "correct": "Revoked",
    "wrong": [
      "Expired",
      "Limited",
      "Scoped"
    ],
    "correctRoast": "Correct. Revoked survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Old approvals can remain active until revoked.",
    "i18n": {
      "en": {
        "prompt": "What should happen to old unused permissions?",
        "correct": "Revoked",
        "wrong": [
          "Expired",
          "Limited",
          "Scoped"
        ]
      },
      "fr": {
        "prompt": "Que faut-il faire aux anciennes permissions inutilisées ?",
        "correct": "Révoqué",
        "wrong": [
          "Expiré",
          "Limité",
          "Cadré"
        ]
      },
      "es": {
        "prompt": "¿Qué debería pasar con permisos viejos sin uso?",
        "correct": "Revocado",
        "wrong": [
          "Expirado",
          "Limitado",
          "Acotado"
        ]
      }
    }
  },
  {
    "id": "squig-internal-008",
    "tier": 4,
    "category": "Address Poisoning",
    "prompt": "What scam uses tiny lookalike transfers?",
    "correct": "Poisoning",
    "wrong": [
      "Dusting",
      "Phishing",
      "Spoofing"
    ],
    "correctRoast": "Correct. Poisoning survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Address poisoning tries to trick users into copying the wrong destination.",
    "i18n": {
      "en": {
        "prompt": "What scam uses tiny lookalike transfers?",
        "correct": "Poisoning",
        "wrong": [
          "Dusting",
          "Phishing",
          "Spoofing"
        ]
      },
      "fr": {
        "prompt": "Quelle arnaque utilise de petits transferts ressemblants ?",
        "correct": "Poisoning",
        "wrong": [
          "Dusting",
          "Phishing",
          "Spoofing"
        ]
      },
      "es": {
        "prompt": "¿Qué estafa usa transferencias pequeñas parecidas?",
        "correct": "Poisoning",
        "wrong": [
          "Dusting",
          "Phishing",
          "Spoofing"
        ]
      }
    }
  },
  {
    "id": "squig-internal-009",
    "tier": 4,
    "category": "Name Resolution",
    "prompt": "What readable-name service must resolve correctly before sending?",
    "correct": "ENS",
    "wrong": [
      "DNS",
      "URL",
      "IPFS"
    ],
    "correctRoast": "Correct. ENS survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "ENS names should resolve to the intended wallet before funds are sent.",
    "i18n": {
      "en": {
        "prompt": "What readable-name service must resolve correctly before sending?",
        "correct": "ENS",
        "wrong": [
          "DNS",
          "URL",
          "IPFS"
        ]
      },
      "fr": {
        "prompt": "Quel service de nom lisible doit résoudre correctement avant envoi ?",
        "correct": "ENS",
        "wrong": [
          "DNS",
          "URL",
          "IPFS"
        ]
      },
      "es": {
        "prompt": "¿Qué servicio de nombre legible debe resolver bien antes de enviar?",
        "correct": "ENS",
        "wrong": [
          "DNS",
          "URL",
          "IPFS"
        ]
      }
    }
  },
  {
    "id": "squig-internal-010",
    "tier": 4,
    "category": "Wrapped Assets",
    "prompt": "What tokenized asset is often used for marketplace bids?",
    "correct": "WETH",
    "wrong": [
      "USDC",
      "BTC",
      "SOL"
    ],
    "correctRoast": "Correct. WETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "WETH lets contracts handle ETH-like value in token form.",
    "i18n": {
      "en": {
        "prompt": "What tokenized asset is often used for marketplace bids?",
        "correct": "WETH",
        "wrong": [
          "USDC",
          "BTC",
          "SOL"
        ]
      },
      "fr": {
        "prompt": "Quel actif tokenisé est souvent utilisé pour les offres marketplace ?",
        "correct": "WETH",
        "wrong": [
          "USDC",
          "BTC",
          "SOL"
        ]
      },
      "es": {
        "prompt": "¿Qué activo tokenizado se usa a menudo para ofertas de marketplace?",
        "correct": "WETH",
        "wrong": [
          "USDC",
          "BTC",
          "SOL"
        ]
      }
    }
  },
  {
    "id": "squig-internal-011",
    "tier": 4,
    "category": "Swaps",
    "prompt": "What problem means final trade price differs from the quote?",
    "correct": "Slippage",
    "wrong": [
      "Spread",
      "Volatility",
      "Premium"
    ],
    "correctRoast": "Correct. Slippage survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Slippage is common in swaps and can affect token trades.",
    "i18n": {
      "en": {
        "prompt": "What problem means final trade price differs from the quote?",
        "correct": "Slippage",
        "wrong": [
          "Spread",
          "Volatility",
          "Premium"
        ]
      },
      "fr": {
        "prompt": "Quel problème signifie que le prix final diffère du devis ?",
        "correct": "Slippage",
        "wrong": [
          "Spread",
          "Volatilité",
          "Prime"
        ]
      },
      "es": {
        "prompt": "¿Qué problema significa que el precio final difiere de la cotización?",
        "correct": "Slippage",
        "wrong": [
          "Spread",
          "Volatilidad",
          "Prima"
        ]
      }
    }
  },
  {
    "id": "squig-internal-012",
    "tier": 4,
    "category": "Selling",
    "prompt": "What makes collectibles harder to sell quickly?",
    "correct": "Liquidity",
    "wrong": [
      "Volume",
      "Demand",
      "Floor"
    ],
    "correctRoast": "Correct. Liquidity survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "NFT liquidity depends on buyers, demand, price, and individual item appeal.",
    "i18n": {
      "en": {
        "prompt": "What makes collectibles harder to sell quickly?",
        "correct": "Liquidity",
        "wrong": [
          "Volume",
          "Demand",
          "Floor"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui rend les collectibles plus difficiles à vendre vite ?",
        "correct": "Liquidité",
        "wrong": [
          "Volume",
          "Demande",
          "Floor"
        ]
      },
      "es": {
        "prompt": "¿Qué hace que coleccionables sean más difíciles de vender rápido?",
        "correct": "Liquidez",
        "wrong": [
          "Volumen",
          "Demanda",
          "Floor"
        ]
      }
    }
  },
  {
    "id": "squig-internal-013",
    "tier": 4,
    "category": "Records",
    "prompt": "What records may matter after purchases and sales?",
    "correct": "Taxes",
    "wrong": [
      "Receipts",
      "Audits",
      "Profit"
    ],
    "correctRoast": "Correct. Taxes survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Crypto and NFT activity may have tax consequences depending on location.",
    "i18n": {
      "en": {
        "prompt": "What records may matter after purchases and sales?",
        "correct": "Taxes",
        "wrong": [
          "Receipts",
          "Audits",
          "Profit"
        ]
      },
      "fr": {
        "prompt": "Quels registres peuvent compter après achats et ventes ?",
        "correct": "Taxes",
        "wrong": [
          "Reçus",
          "Audits",
          "Profit"
        ]
      },
      "es": {
        "prompt": "¿Qué registros pueden importar después de compras y ventas?",
        "correct": "Impuestos",
        "wrong": [
          "Recibos",
          "Auditorías",
          "Ganancia"
        ]
      }
    }
  },
  {
    "id": "squig-internal-014",
    "tier": 4,
    "category": "Cross-Chain",
    "prompt": "What route between chains adds extra risk?",
    "correct": "Bridge",
    "wrong": [
      "Swap",
      "Wrap",
      "Transfer"
    ],
    "correctRoast": "Correct. Bridge survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Bridges add contract, network, and operational complexity.",
    "i18n": {
      "en": {
        "prompt": "What route between chains adds extra risk?",
        "correct": "Bridge",
        "wrong": [
          "Swap",
          "Wrap",
          "Transfer"
        ]
      },
      "fr": {
        "prompt": "Quelle route entre chaînes ajoute un risque supplémentaire ?",
        "correct": "Bridge",
        "wrong": [
          "Swap",
          "Wrap",
          "Transfert"
        ]
      },
      "es": {
        "prompt": "¿Qué ruta entre cadenas añade riesgo extra?",
        "correct": "Bridge",
        "wrong": [
          "Swap",
          "Wrap",
          "Transferir"
        ]
      }
    }
  },
  {
    "id": "squig-internal-015",
    "tier": 4,
    "category": "Influencers",
    "prompt": "What should public hype claims be treated as?",
    "correct": "Marketing",
    "wrong": [
      "Advice",
      "Research",
      "Audit"
    ],
    "correctRoast": "Correct. Marketing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Influencer posts can be biased, sponsored, or wrong.",
    "i18n": {
      "en": {
        "prompt": "What should public hype claims be treated as?",
        "correct": "Marketing",
        "wrong": [
          "Advice",
          "Research",
          "Audit"
        ]
      },
      "fr": {
        "prompt": "Comme quoi faut-il traiter les affirmations hype publiques ?",
        "correct": "Marketing",
        "wrong": [
          "Conseil",
          "Recherche",
          "Audit"
        ]
      },
      "es": {
        "prompt": "¿Cómo deben tratarse las afirmaciones públicas de hype?",
        "correct": "Marketing",
        "wrong": [
          "Consejo",
          "Investigación",
          "Auditoría"
        ]
      }
    }
  },
  {
    "id": "squig-internal-016",
    "tier": 4,
    "category": "Scam Signals",
    "prompt": "Which promise is a classic scam signal?",
    "correct": "Guaranteed",
    "wrong": [
      "Pump",
      "Bonus",
      "Yield"
    ],
    "correctRoast": "Correct. Guaranteed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Guaranteed profit language is a common red flag.",
    "i18n": {
      "en": {
        "prompt": "Which promise is a classic scam signal?",
        "correct": "Guaranteed",
        "wrong": [
          "Pump",
          "Bonus",
          "Yield"
        ]
      },
      "fr": {
        "prompt": "Quelle promesse est un signal classique d'arnaque ?",
        "correct": "Garanti",
        "wrong": [
          "Pump",
          "Bonus",
          "Rendement"
        ]
      },
      "es": {
        "prompt": "¿Qué promesa es una señal clásica de estafa?",
        "correct": "Garantizado",
        "wrong": [
          "Pump",
          "Bono",
          "Rendimiento"
        ]
      }
    }
  },
  {
    "id": "squig-internal-017",
    "tier": 4,
    "category": "Privacy",
    "prompt": "What goal is improved by separating public identity from storage?",
    "correct": "Privacy",
    "wrong": [
      "Security",
      "Rarity",
      "Liquidity"
    ],
    "correctRoast": "Correct. Privacy survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wallet separation can reduce privacy leakage and risk concentration.",
    "i18n": {
      "en": {
        "prompt": "What goal is improved by separating public identity from storage?",
        "correct": "Privacy",
        "wrong": [
          "Security",
          "Rarity",
          "Liquidity"
        ]
      },
      "fr": {
        "prompt": "Quel objectif est amélioré en séparant identité publique et stockage ?",
        "correct": "Vieprivée",
        "wrong": [
          "Sécurité",
          "Rareté",
          "Liquidité"
        ]
      },
      "es": {
        "prompt": "¿Qué objetivo mejora al separar identidad pública y almacenamiento?",
        "correct": "Privacidad",
        "wrong": [
          "Seguridad",
          "Rareza",
          "Liquidez"
        ]
      }
    }
  },
  {
    "id": "squig-internal-018",
    "tier": 4,
    "category": "Devices",
    "prompt": "How should shared computers be treated for wallet use?",
    "correct": "Risky",
    "wrong": [
      "Shared",
      "Public",
      "Unknown"
    ],
    "correctRoast": "Correct. Risky survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Shared devices can expose sessions, screens, extensions, or secrets.",
    "i18n": {
      "en": {
        "prompt": "How should shared computers be treated for wallet use?",
        "correct": "Risky",
        "wrong": [
          "Shared",
          "Public",
          "Unknown"
        ]
      },
      "fr": {
        "prompt": "Comment traiter les ordinateurs partagés pour l'usage wallet ?",
        "correct": "Risque",
        "wrong": [
          "Partagé",
          "Public",
          "Inconnu"
        ]
      },
      "es": {
        "prompt": "¿Cómo tratar computadores compartidos para usar wallets?",
        "correct": "Riesgo",
        "wrong": [
          "Compartido",
          "Público",
          "Desconocido"
        ]
      }
    }
  },
  {
    "id": "squig-internal-019",
    "tier": 4,
    "category": "Persistent Orders",
    "prompt": "Which buyer-side order can remain active until canceled or expired?",
    "correct": "Offer",
    "wrong": [
      "Listing",
      "Approval",
      "Signature"
    ],
    "correctRoast": "Correct. Offer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Offers and listings can persist according to marketplace rules.",
    "i18n": {
      "en": {
        "prompt": "Which buyer-side order can remain active until canceled or expired?",
        "correct": "Offer",
        "wrong": [
          "Listing",
          "Approval",
          "Signature"
        ]
      },
      "fr": {
        "prompt": "Quel ordre côté acheteur peut rester actif jusqu'à annulation ou expiration ?",
        "correct": "Offre",
        "wrong": [
          "Listing",
          "Approbation",
          "Signature"
        ]
      },
      "es": {
        "prompt": "¿Qué orden del comprador puede seguir activa hasta cancelarse o expirar?",
        "correct": "Oferta",
        "wrong": [
          "Listing",
          "Aprobación",
          "Firma"
        ]
      }
    }
  },
  {
    "id": "squig-internal-020",
    "tier": 4,
    "category": "Configuration",
    "prompt": "What should app code use instead of hardcoded lore values?",
    "correct": "Config",
    "wrong": [
      "Chat",
      "Copy",
      "Lore"
    ],
    "correctRoast": "Correct. Config survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Configuration keeps deployment-specific values out of question lore and random chat copy.",
    "i18n": {
      "en": {
        "prompt": "What should app code use instead of hardcoded lore values?",
        "correct": "Config",
        "wrong": [
          "Chat",
          "Copy",
          "Lore"
        ]
      },
      "fr": {
        "prompt": "Que doit utiliser le code app au lieu de valeurs lore codées en dur ?",
        "correct": "Config",
        "wrong": [
          "Chat",
          "Copie",
          "Lore"
        ]
      },
      "es": {
        "prompt": "¿Qué debe usar el código en vez de valores lore hardcodeados?",
        "correct": "Config",
        "wrong": [
          "Chat",
          "Copia",
          "Lore"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-001",
    "tier": 5,
    "category": "Full Flow",
    "prompt": "What should be completed before shopping for a Squig?",
    "correct": "Setup",
    "wrong": [
      "Funding",
      "Research",
      "Security"
    ],
    "correctRoast": "Correct. Setup survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A safe path includes wallet setup, funding, careful review, and risk awareness.",
    "i18n": {
      "en": {
        "prompt": "What should be completed before shopping for a Squig?",
        "correct": "Setup",
        "wrong": [
          "Funding",
          "Research",
          "Security"
        ]
      },
      "fr": {
        "prompt": "Que faut-il compléter avant d'acheter un Squig ?",
        "correct": "Setup",
        "wrong": [
          "Financer",
          "Recherche",
          "Sécurité"
        ]
      },
      "es": {
        "prompt": "¿Qué debe completarse antes de comprar un Squig?",
        "correct": "Setup",
        "wrong": [
          "Fondos",
          "Investigación",
          "Seguridad"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-002",
    "tier": 5,
    "category": "Withdrawals",
    "prompt": "Which chain choice must match before moving ETH from an exchange?",
    "correct": "Network",
    "wrong": [
      "Address",
      "Asset",
      "Wallet"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Network mismatch can trap assets away from the intended app or wallet.",
    "i18n": {
      "en": {
        "prompt": "Which chain choice must match before moving ETH from an exchange?",
        "correct": "Network",
        "wrong": [
          "Address",
          "Asset",
          "Wallet"
        ]
      },
      "fr": {
        "prompt": "Quel choix de chaîne doit correspondre avant de déplacer ETH depuis un exchange ?",
        "correct": "Réseau",
        "wrong": [
          "Adresse",
          "Actif",
          "Wallet"
        ]
      },
      "es": {
        "prompt": "¿Qué elección de cadena debe coincidir antes de mover ETH desde un exchange?",
        "correct": "Red",
        "wrong": [
          "Dirección",
          "Activo",
          "Wallet"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-003",
    "tier": 5,
    "category": "Checkout",
    "prompt": "Which final wallet detail should match the amount shown at checkout?",
    "correct": "Price",
    "wrong": [
      "Contract",
      "Network",
      "Token"
    ],
    "correctRoast": "Correct. Contract survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The wallet amount should match the marketplace checkout amount before confirming.",
    "i18n": {
      "en": {
        "prompt": "Which final wallet detail should match the amount shown at checkout?",
        "correct": "Price",
        "wrong": [
          "Contract",
          "Network",
          "Token"
        ]
      },
      "fr": {
        "prompt": "Quel détail final du wallet doit correspondre au montant affiché au checkout ?",
        "correct": "Prix",
        "wrong": [
          "Contrat",
          "Réseau",
          "Token"
        ]
      },
      "es": {
        "prompt": "¿Qué detalle final del wallet debe coincidir con el monto del checkout?",
        "correct": "Precio",
        "wrong": [
          "Contrato",
          "Red",
          "Token"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-004",
    "tier": 5,
    "category": "Support",
    "prompt": "Which recovery phrase should be refused when anyone offers help?",
    "correct": "Seed",
    "wrong": [
      "Password",
      "Ticket",
      "Link"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Recovery help should never require wallet recovery secrets.",
    "i18n": {
      "en": {
        "prompt": "Which recovery phrase should be refused when anyone offers help?",
        "correct": "Seed",
        "wrong": [
          "Password",
          "Ticket",
          "Link"
        ]
      },
      "fr": {
        "prompt": "Quelle phrase de récupération faut-il refuser si quelqu'un propose de l'aide ?",
        "correct": "Seed",
        "wrong": [
          "Passe",
          "Ticket",
          "Lien"
        ]
      },
      "es": {
        "prompt": "¿Qué frase de recuperación debe rechazarse cuando alguien ofrece ayuda?",
        "correct": "Semilla",
        "wrong": [
          "Clave",
          "Ticket",
          "Enlace"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-005",
    "tier": 5,
    "category": "Lost Funds",
    "prompt": "Which chain mismatch can make withdrawn assets hard to access?",
    "correct": "Network",
    "wrong": [
      "Address",
      "Asset",
      "Wallet"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Sending on the wrong network can make assets difficult or impossible to recover.",
    "i18n": {
      "en": {
        "prompt": "Which chain mismatch can make withdrawn assets hard to access?",
        "correct": "Network",
        "wrong": [
          "Address",
          "Asset",
          "Wallet"
        ]
      },
      "fr": {
        "prompt": "Quelle incompatibilité de chaîne peut rendre des actifs retirés difficiles d'accès ?",
        "correct": "Réseau",
        "wrong": [
          "Adresse",
          "Actif",
          "Wallet"
        ]
      },
      "es": {
        "prompt": "¿Qué incompatibilidad de cadena puede dificultar acceso a activos retirados?",
        "correct": "Red",
        "wrong": [
          "Dirección",
          "Activo",
          "Wallet"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-006",
    "tier": 5,
    "category": "Offers",
    "prompt": "Which offer field tells when a bid stops being valid?",
    "correct": "Expiration",
    "wrong": [
      "Currency",
      "Amount",
      "Royalty"
    ],
    "correctRoast": "Correct. Verification survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Offer expiration matters because active bids can disappear or remain valid only until their deadline.",
    "i18n": {
      "en": {
        "prompt": "Which offer field tells when a bid stops being valid?",
        "correct": "Expiration",
        "wrong": [
          "Currency",
          "Amount",
          "Royalty"
        ]
      },
      "fr": {
        "prompt": "Quel champ d'offre indique quand une enchère cesse d'être valide ?",
        "correct": "Expiration",
        "wrong": [
          "Devise",
          "Montant",
          "Royalty"
        ]
      },
      "es": {
        "prompt": "¿Qué campo de oferta indica cuándo una puja deja de ser válida?",
        "correct": "Vencimiento",
        "wrong": [
          "Moneda",
          "Monto",
          "Regalía"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-007",
    "tier": 5,
    "category": "Offer Review",
    "prompt": "Which field can expose a huge bid made in the wrong token?",
    "correct": "Currency",
    "wrong": [
      "Amount",
      "Expiry",
      "Fee"
    ],
    "correctRoast": "Correct. Currency survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Large offers can use unexpected currencies, terms, or expiration rules.",
    "i18n": {
      "en": {
        "prompt": "Which field can expose a huge bid made in the wrong token?",
        "correct": "Currency",
        "wrong": [
          "Amount",
          "Expiry",
          "Fee"
        ]
      },
      "fr": {
        "prompt": "Quel champ peut révéler une grosse offre dans le mauvais token ?",
        "correct": "Devise",
        "wrong": [
          "Montant",
          "Expiration",
          "Frais"
        ]
      },
      "es": {
        "prompt": "¿Qué campo puede revelar una oferta enorme en el token equivocado?",
        "correct": "Moneda",
        "wrong": [
          "Monto",
          "Vencimiento",
          "Tarifa"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-008",
    "tier": 5,
    "category": "Permission Attacks",
    "prompt": "What can a malicious broad permission move?",
    "correct": "Assets",
    "wrong": [
      "Listings",
      "Metadata",
      "Profiles"
    ],
    "correctRoast": "Correct. Assets survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Broad approvals can expose valuable wallet assets.",
    "i18n": {
      "en": {
        "prompt": "What can a malicious broad permission move?",
        "correct": "Assets",
        "wrong": [
          "Listings",
          "Metadata",
          "Profiles"
        ]
      },
      "fr": {
        "prompt": "Que peut déplacer une permission large et malveillante ?",
        "correct": "Actifs",
        "wrong": [
          "Listings",
          "Métadonnées",
          "Profils"
        ]
      },
      "es": {
        "prompt": "¿Qué puede mover un permiso amplio y malicioso?",
        "correct": "Activos",
        "wrong": [
          "Listings",
          "Metadatos",
          "Perfiles"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-009",
    "tier": 5,
    "category": "Storage",
    "prompt": "Which storage role should protect valuable Squigs after purchase?",
    "correct": "Vault",
    "wrong": [
      "Cold",
      "Hardware",
      "Burner"
    ],
    "correctRoast": "Correct. Vault survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A low-interaction vault wallet reduces exposure for valuable assets.",
    "i18n": {
      "en": {
        "prompt": "Which storage role should protect valuable Squigs after purchase?",
        "correct": "Vault",
        "wrong": [
          "Cold",
          "Hardware",
          "Burner"
        ]
      },
      "fr": {
        "prompt": "Quel rôle de stockage doit protéger les Squigs précieux après achat ?",
        "correct": "Coffre",
        "wrong": [
          "Cold",
          "Matériel",
          "Burner"
        ]
      },
      "es": {
        "prompt": "¿Qué rol de almacenamiento debería proteger Squigs valiosos tras comprar?",
        "correct": "Bóveda",
        "wrong": [
          "Cold",
          "Hardware",
          "Burner"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-010",
    "tier": 5,
    "category": "Exit Risk",
    "prompt": "What can vanish before a seller finds a fair price?",
    "correct": "Buyers",
    "wrong": [
      "Liquidity",
      "Demand",
      "Volume"
    ],
    "correctRoast": "Correct. Buyers survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "NFT liquidity can change quickly; buyers are not guaranteed.",
    "i18n": {
      "en": {
        "prompt": "What can vanish before a seller finds a fair price?",
        "correct": "Buyers",
        "wrong": [
          "Liquidity",
          "Demand",
          "Volume"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut disparaître avant qu'un vendeur trouve un bon prix ?",
        "correct": "Acheteurs",
        "wrong": [
          "Liquidité",
          "Demande",
          "Volume"
        ]
      },
      "es": {
        "prompt": "¿Qué puede desaparecer antes de que un vendedor encuentre buen precio?",
        "correct": "Compradores",
        "wrong": [
          "Liquidez",
          "Demanda",
          "Volumen"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-011",
    "tier": 5,
    "category": "Announcements",
    "prompt": "What should urgent migration posts trigger first?",
    "correct": "Verification",
    "wrong": [
      "Delay",
      "Ignore",
      "Question"
    ],
    "correctRoast": "Correct. Verification survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Urgent migration messages are common phishing bait and should be verified.",
    "i18n": {
      "en": {
        "prompt": "What should urgent migration posts trigger first?",
        "correct": "Verification",
        "wrong": [
          "Delay",
          "Ignore",
          "Question"
        ]
      },
      "fr": {
        "prompt": "Que doivent déclencher d'abord les annonces de migration urgente ?",
        "correct": "Vérification",
        "wrong": [
          "Délai",
          "Ignorer",
          "Question"
        ]
      },
      "es": {
        "prompt": "¿Qué deben provocar primero los anuncios de migración urgente?",
        "correct": "Verificación",
        "wrong": [
          "Demora",
          "Ignorar",
          "Pregunta"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-012",
    "tier": 5,
    "category": "Status Checks",
    "prompt": "What public tool checks purchase status independently?",
    "correct": "Explorer",
    "wrong": [
      "Receipt",
      "Wallet",
      "Market"
    ],
    "correctRoast": "Correct. Explorer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A block explorer confirms public transaction and ownership state.",
    "i18n": {
      "en": {
        "prompt": "What public tool checks purchase status independently?",
        "correct": "Explorer",
        "wrong": [
          "Receipt",
          "Wallet",
          "Market"
        ]
      },
      "fr": {
        "prompt": "Quel outil public vérifie indépendamment le statut d'achat ?",
        "correct": "Explorer",
        "wrong": [
          "Reçu",
          "Wallet",
          "Marché"
        ]
      },
      "es": {
        "prompt": "¿Qué herramienta pública verifica independientemente el estado de compra?",
        "correct": "Explorer",
        "wrong": [
          "Recibo",
          "Wallet",
          "Mercado"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-013",
    "tier": 5,
    "category": "Missing Images",
    "prompt": "What should be checked when new art is not visible yet?",
    "correct": "Ownership",
    "wrong": [
      "Metadata",
      "Cache",
      "Listing"
    ],
    "correctRoast": "Correct. Ownership survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Display delays do not necessarily mean ownership failed.",
    "i18n": {
      "en": {
        "prompt": "What should be checked when new art is not visible yet?",
        "correct": "Ownership",
        "wrong": [
          "Metadata",
          "Cache",
          "Listing"
        ]
      },
      "fr": {
        "prompt": "Que faut-il vérifier quand le nouvel art n'est pas encore visible ?",
        "correct": "Propriété",
        "wrong": [
          "Métadonnées",
          "Cache",
          "Listing"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe revisar cuando el arte nuevo aún no aparece?",
        "correct": "Propiedad",
        "wrong": [
          "Metadatos",
          "Cache",
          "Listing"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-014",
    "tier": 5,
    "category": "Delisting",
    "prompt": "What cancels an unwanted sale order?",
    "correct": "Delist",
    "wrong": [
      "Cancel",
      "Revoke",
      "Hide"
    ],
    "correctRoast": "Correct. Delist survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Listings may remain active until canceled through marketplace rules.",
    "i18n": {
      "en": {
        "prompt": "What cancels an unwanted sale order?",
        "correct": "Delist",
        "wrong": [
          "Cancel",
          "Revoke",
          "Hide"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui annule un ordre de vente non désiré ?",
        "correct": "Delister",
        "wrong": [
          "Annuler",
          "Révoquer",
          "Cacher"
        ]
      },
      "es": {
        "prompt": "¿Qué cancela una orden de venta no deseada?",
        "correct": "Delistar",
        "wrong": [
          "Cancelar",
          "Revocar",
          "Ocultar"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-015",
    "tier": 5,
    "category": "Old Bids",
    "prompt": "What can old wrapped bids still do while active?",
    "correct": "Execute",
    "wrong": [
      "Display",
      "Index",
      "Notify"
    ],
    "correctRoast": "Correct. Execute survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Active offers can execute if their terms are met before cancellation or expiration.",
    "i18n": {
      "en": {
        "prompt": "What can old wrapped bids still do while active?",
        "correct": "Execute",
        "wrong": [
          "Display",
          "Index",
          "Notify"
        ]
      },
      "fr": {
        "prompt": "Que peuvent encore faire d'anciennes offres emballées actives ?",
        "correct": "Exécuter",
        "wrong": [
          "Afficher",
          "Indexer",
          "Notifier"
        ]
      },
      "es": {
        "prompt": "¿Qué pueden hacer ofertas envueltas viejas mientras siguen activas?",
        "correct": "Ejecutar",
        "wrong": [
          "Mostrar",
          "Indexar",
          "Notificar"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-016",
    "tier": 5,
    "category": "Recovery",
    "prompt": "What must be backed up before device loss?",
    "correct": "Seed",
    "wrong": [
      "Password",
      "Device",
      "Email"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Without a secure recovery backup, self-custody access can be permanently lost.",
    "i18n": {
      "en": {
        "prompt": "What must be backed up before device loss?",
        "correct": "Seed",
        "wrong": [
          "Password",
          "Device",
          "Email"
        ]
      },
      "fr": {
        "prompt": "Que faut-il sauvegarder avant la perte d'un appareil ?",
        "correct": "Seed",
        "wrong": [
          "Passe",
          "Appareil",
          "Email"
        ]
      },
      "es": {
        "prompt": "¿Qué debe respaldarse antes de perder un dispositivo?",
        "correct": "Semilla",
        "wrong": [
          "Clave",
          "Dispositivo",
          "Email"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-017",
    "tier": 5,
    "category": "Wallet Separation",
    "prompt": "What separates public identity from vault storage?",
    "correct": "Wallets",
    "wrong": [
      "Accounts",
      "Profiles",
      "Vaults"
    ],
    "correctRoast": "Correct. Wallets survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Separate wallets can reduce privacy exposure and limit damage from risky activity.",
    "i18n": {
      "en": {
        "prompt": "What separates public identity from vault storage?",
        "correct": "Wallets",
        "wrong": [
          "Accounts",
          "Profiles",
          "Vaults"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui sépare l'identité publique du stockage coffre ?",
        "correct": "Wallets",
        "wrong": [
          "Comptes",
          "Profils",
          "Coffres"
        ]
      },
      "es": {
        "prompt": "¿Qué separa identidad pública del almacenamiento bóveda?",
        "correct": "Wallets",
        "wrong": [
          "Cuentas",
          "Perfiles",
          "Bóvedas"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-018",
    "tier": 5,
    "category": "Education",
    "prompt": "What is this onboarding game instead of financial advice?",
    "correct": "Education",
    "wrong": [
      "Tutorial",
      "Signal",
      "Advice"
    ],
    "correctRoast": "Correct. Education survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The game teaches concepts and does not promise profit or provide financial advice.",
    "i18n": {
      "en": {
        "prompt": "What is this onboarding game instead of financial advice?",
        "correct": "Education",
        "wrong": [
          "Tutorial",
          "Signal",
          "Advice"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce que ce jeu d'onboarding au lieu d'un conseil financier ?",
        "correct": "Éducation",
        "wrong": [
          "Tutoriel",
          "Signal",
          "Conseil"
        ]
      },
      "es": {
        "prompt": "¿Qué es este juego de onboarding en vez de consejo financiero?",
        "correct": "Educación",
        "wrong": [
          "Tutorial",
          "Señal",
          "Consejo"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-019",
    "tier": 5,
    "category": "Final Pause",
    "prompt": "What first action should interrupt final-second buying pressure?",
    "correct": "Pause",
    "wrong": [
      "Review",
      "Verify",
      "Wait"
    ],
    "correctRoast": "Correct. Pause survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A final pause helps catch wrong sites, contracts, networks, amounts, and permissions.",
    "i18n": {
      "en": {
        "prompt": "What first action should interrupt final-second buying pressure?",
        "correct": "Pause",
        "wrong": [
          "Review",
          "Verify",
          "Wait"
        ]
      },
      "fr": {
        "prompt": "Quelle première action doit interrompre la pression d'achat finale ?",
        "correct": "Pause",
        "wrong": [
          "Revoir",
          "Vérifier",
          "Attendre"
        ]
      },
      "es": {
        "prompt": "¿Qué primera acción debe interrumpir la presión final de compra?",
        "correct": "Pausa",
        "wrong": [
          "Revisar",
          "Verificar",
          "Esperar"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-020",
    "tier": 5,
    "category": "Responsible Buying",
    "prompt": "What best describes responsible Squig buying?",
    "correct": "Safety",
    "wrong": [
      "Research",
      "Caution",
      "Planning"
    ],
    "correctRoast": "Correct. Safety survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Responsible buying means verifying sources, understanding wallet prompts, and accepting risk.",
    "i18n": {
      "en": {
        "prompt": "What best describes responsible Squig buying?",
        "correct": "Safety",
        "wrong": [
          "Research",
          "Caution",
          "Planning"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui décrit le mieux un achat Squig responsable ?",
        "correct": "Sécurité",
        "wrong": [
          "Recherche",
          "Prudence",
          "Planifier"
        ]
      },
      "es": {
        "prompt": "¿Qué describe mejor una compra Squig responsable?",
        "correct": "Seguridad",
        "wrong": [
          "Investigación",
          "Cautela",
          "Planear"
        ]
      }
    }
  }
]`);

function upgradeQuestion(entry) {
  return {
    category: entry.category,
    prompt: entry.en,
    correct: entry.c,
    wrong: entry.w,
    correctRoast: `Correct. ${entry.c} gets the ugly stamp; the clipboard stops leaking.`,
    wrongRoast: "Wrong. Close-looking paperwork is still wrong paperwork.",
    explanation: entry.x,
    i18n: {
      en: { prompt: entry.en, correct: entry.c, wrong: entry.w },
      fr: { prompt: entry.fr, correct: entry.cf, wrong: entry.wf },
      es: { prompt: entry.es, correct: entry.cs, wrong: entry.ws }
    }
  };
}

const QUESTION_UPGRADES = new Map([
  {
    id: "squig-easy-001",
    category: "Fiat Onboarding",
    en: "Which money type is usually deposited before a first on-ramp purchase?",
    fr: "Quel type d'argent est généralement déposé avant un premier achat via rampe ?",
    es: "¿Qué tipo de dinero suele depositarse antes de una primera compra por rampa?",
    c: "Fiat",
    cf: "Fiat",
    cs: "Fiat",
    w: ["Cash"],
    wf: ["Cash"],
    ws: ["Efectivo"],
    x: "Most beginners start with government-issued money before buying crypto through an on-ramp or exchange."
  },
  {
    id: "squig-easy-002",
    category: "On-Ramps",
    en: "Which platform type commonly converts bank money into coins before self-custody?",
    fr: "Quel type de plateforme convertit souvent l'argent bancaire en coins avant l'auto-garde ?",
    es: "¿Qué tipo de plataforma suele convertir dinero bancario en monedas antes de autocustodia?",
    c: "Exchange",
    cf: "Exchange",
    cs: "Exchange",
    w: ["Wallet"],
    wf: ["Wallet"],
    ws: ["Wallet"],
    x: "A centralized exchange is a common fiat-to-crypto entry point; a wallet controls assets after withdrawal."
  },
  {
    id: "squig-easy-003",
    category: "Ethereum",
    en: "Which asset pays execution costs on the main Ethereum chain?",
    fr: "Quel actif paie les coûts d'exécution sur la chaîne principale Ethereum ?",
    es: "¿Qué activo paga los costos de ejecución en la cadena principal de Ethereum?",
    c: "ETH",
    cf: "ETH",
    cs: "ETH",
    w: ["WETH"],
    wf: ["WETH"],
    ws: ["WETH"],
    x: "ETH is the native asset used for Ethereum network fees; WETH is a wrapped token form used in some contract flows."
  },
  {
    id: "squig-easy-004",
    category: "Wallets",
    en: "Which tool signs blockchain actions while keeping recovery secrets private?",
    fr: "Quel outil signe les actions blockchain tout en gardant les secrets de récupération privés ?",
    es: "¿Qué herramienta firma acciones blockchain manteniendo privados los secretos de recuperación?",
    c: "Wallet",
    cf: "Wallet",
    cs: "Wallet",
    w: ["Account"],
    wf: ["Compte"],
    ws: ["Cuenta"],
    x: "A wallet manages keys and signs transactions or messages; an account label alone is not key control."
  },
  {
    id: "squig-easy-005",
    category: "Recovery",
    en: "Which recovery item can control full access if imported elsewhere?",
    fr: "Quel élément de récupération peut contrôler tout l'accès s'il est importé ailleurs ?",
    es: "¿Qué elemento de recuperación puede controlar todo el acceso si se importa en otro lugar?",
    c: "Seed",
    cf: "Seed",
    cs: "Seed",
    w: ["Password"],
    wf: ["Passe"],
    ws: ["Clave"],
    x: "A seed phrase can restore a wallet and should never be shared, screenshotted, or pasted into random sites."
  },
  {
    id: "squig-easy-006",
    category: "Transfers",
    en: "Which public destination receives assets from an on-ramp withdrawal?",
    fr: "Quelle destination publique reçoit les actifs retirés depuis une rampe ?",
    es: "¿Qué destino público recibe activos retirados desde una rampa?",
    c: "Address",
    cf: "Adresse",
    cs: "Dirección",
    w: ["Username"],
    wf: ["Pseudo"],
    ws: ["Usuario"],
    x: "A public address receives assets; recovery secrets are never needed for receiving."
  },
  {
    id: "squig-easy-007",
    category: "Fees",
    en: "Which transaction cost changes with chain demand?",
    fr: "Quel coût de transaction change avec la demande de la chaîne ?",
    es: "¿Qué costo de transacción cambia con la demanda de la cadena?",
    c: "Gas",
    cf: "Gas",
    cs: "Gas",
    w: ["Spread"],
    wf: ["Spread"],
    ws: ["Spread"],
    x: "Gas is the network fee; spread is usually an exchange quote difference."
  },
  {
    id: "squig-easy-008",
    category: "Networks",
    en: "Which live environment uses real assets instead of practice funds?",
    fr: "Quel environnement actif utilise de vrais actifs au lieu de fonds d'essai ?",
    es: "¿Qué entorno activo usa activos reales en vez de fondos de prueba?",
    c: "Mainnet",
    cf: "Mainnet",
    cs: "Mainnet",
    w: ["Testnet"],
    wf: ["Testnet"],
    ws: ["Testnet"],
    x: "Mainnet activity involves real value and real fees; testnets are for practice and development."
  },
  {
    id: "squig-easy-009",
    category: "NFTs",
    en: "Which unique token type can represent a Squig collectible?",
    fr: "Quel type de token unique peut représenter un collectible Squig ?",
    es: "¿Qué tipo de token único puede representar un coleccionable Squig?",
    c: "NFT",
    cf: "NFT",
    cs: "NFT",
    w: ["ERC20"],
    wf: ["ERC20"],
    ws: ["ERC20"],
    x: "An NFT is a unique token; ERC-20 usually describes fungible tokens."
  },
  {
    id: "squig-easy-010",
    category: "Settlement",
    en: "Which shared ledger confirms ownership changes publicly?",
    fr: "Quel registre partagé confirme publiquement les changements de propriété ?",
    es: "¿Qué registro compartido confirma públicamente cambios de propiedad?",
    c: "Blockchain",
    cf: "Blockchain",
    cs: "Blockchain",
    w: ["Database"],
    wf: ["Database"],
    ws: ["Database"],
    x: "A blockchain is a public settlement record maintained by a network, not one private app database."
  },
  {
    id: "squig-easy-011",
    category: "Marketplaces",
    en: "Which market venue is commonly used to buy listed Ethereum collectibles?",
    fr: "Quel lieu de marché sert souvent à acheter des collectibles Ethereum listés ?",
    es: "¿Qué mercado se usa a menudo para comprar coleccionables Ethereum listados?",
    c: "OpenSea",
    cf: "OpenSea",
    cs: "OpenSea",
    w: ["Coinbase"],
    wf: ["Coinbase"],
    ws: ["Coinbase"],
    x: "OpenSea is a major NFT marketplace; Coinbase is more commonly used as a crypto exchange or on-ramp."
  },
  {
    id: "squig-easy-012",
    category: "Listings",
    en: "Which sale state means an owner posted a buyable price?",
    fr: "Quel état de vente signifie qu'un propriétaire a publié un prix achetable ?",
    es: "¿Qué estado de venta significa que el dueño publicó un precio comprable?",
    c: "Listing",
    cf: "Listing",
    cs: "Listing",
    w: ["Offer"],
    wf: ["Offre"],
    ws: ["Oferta"],
    x: "A listing is posted by a seller; an offer is proposed by a buyer."
  },
  {
    id: "squig-easy-013",
    category: "Risk",
    en: "Which user action should come before the first crypto purchase?",
    fr: "Quelle action utilisateur doit précéder le premier achat crypto ?",
    es: "¿Qué acción del usuario debe preceder la primera compra cripto?",
    c: "Research",
    cf: "Recherche",
    cs: "Investigar",
    w: ["FOMO"],
    wf: ["FOMO"],
    ws: ["FOMO"],
    x: "Learning the risks and steps matters before spending real money."
  },
  {
    id: "squig-easy-014",
    category: "Withdrawals",
    en: "Which field chooses the destination chain environment during withdrawals?",
    fr: "Quel champ choisit l'environnement de chaîne destinataire lors des retraits ?",
    es: "¿Qué campo elige el entorno de cadena destino durante retiros?",
    c: "Network",
    cf: "Réseau",
    cs: "Red",
    w: ["Address"],
    wf: ["Adresse"],
    ws: ["Dirección"],
    x: "The destination chain must match what the receiving wallet and app support."
  },
  {
    id: "squig-easy-015",
    category: "Explorers",
    en: "Which public tool shows transaction results by hash?",
    fr: "Quel outil public montre les résultats de transaction par hash ?",
    es: "¿Qué herramienta pública muestra resultados de transacción por hash?",
    c: "Explorer",
    cf: "Explorer",
    cs: "Explorer",
    w: ["Receipt"],
    wf: ["Reçu"],
    ws: ["Recibo"],
    x: "A block explorer independently displays public transaction and wallet data."
  },
  {
    id: "squig-easy-016",
    category: "Signatures",
    en: "Which wallet action can prove control without moving funds?",
    fr: "Quelle action de portefeuille peut prouver le contrôle sans déplacer de fonds ?",
    es: "¿Qué acción de cartera puede probar control sin mover fondos?",
    c: "Signature",
    cf: "Signature",
    cs: "Firma",
    w: ["Approval"],
    wf: ["Approbation"],
    ws: ["Aprobación"],
    x: "Some signatures are used for login or proof of control, while approvals can grant permissions."
  },
  {
    id: "squig-easy-017",
    category: "Permissions",
    en: "Which permission can let a contract move an asset later?",
    fr: "Quelle permission peut laisser un contrat déplacer un actif plus tard ?",
    es: "¿Qué permiso puede dejar que un contrato mueva un activo luego?",
    c: "Approval",
    cf: "Approbation",
    cs: "Aprobación",
    w: ["Login"],
    wf: ["Login"],
    ws: ["Login"],
    x: "Approvals grant smart contracts permissions and should be reviewed carefully."
  },
  {
    id: "squig-easy-018",
    category: "Offers",
    en: "Which wrapped asset is often used for marketplace bids?",
    fr: "Quel actif emballé est souvent utilisé pour les offres marketplace ?",
    es: "¿Qué activo envuelto se usa a menudo para ofertas de marketplace?",
    c: "WETH",
    cf: "WETH",
    cs: "WETH",
    w: ["ETH"],
    wf: ["ETH"],
    ws: ["ETH"],
    x: "WETH lets marketplace contracts handle bid funds in token form."
  },
  {
    id: "squig-easy-019",
    category: "Pricing",
    en: "Which price view shows only the cheapest active sale?",
    fr: "Quelle vue de prix montre seulement la vente active la moins chère ?",
    es: "¿Qué vista de precio muestra solo la venta activa más barata?",
    c: "Floor",
    cf: "Floor",
    cs: "Floor",
    w: ["Average"],
    wf: ["Moyenne"],
    ws: ["Promedio"],
    x: "The floor is the lowest active listing, not a guarantee that any item can sell there."
  },
  {
    id: "squig-easy-020",
    category: "Final Checks",
    en: "Which habit interrupts last-second buying pressure?",
    fr: "Quelle habitude interrompt la pression d'achat de dernière seconde ?",
    es: "¿Qué hábito interrumpe la presión de compra del último segundo?",
    c: "Pause",
    cf: "Pause",
    cs: "Pausa",
    w: ["Click"],
    wf: ["Cliquer"],
    ws: ["Clic"],
    x: "Pausing before confirmation helps catch wrong sites, wrong costs, and unsafe permissions."
  },
  {
    id: "squig-certified-001",
    category: "Exchange Setup",
    en: "Which identity step do many centralized platforms require before fiat buys?",
    fr: "Quelle étape d'identité beaucoup de plateformes centralisées exigent avant les achats fiat ?",
    es: "¿Qué paso de identidad exigen muchas plataformas centralizadas antes de compras fiat?",
    c: "KYC",
    cf: "KYC",
    cs: "KYC",
    w: ["AML", "Login"],
    wf: ["AML", "Login"],
    ws: ["AML", "Login"],
    x: "KYC verifies customer identity; AML is a broader compliance category."
  },
  {
    id: "squig-certified-002",
    category: "Exchange Quotes",
    en: "Which quote component is often baked into buy and sell prices?",
    fr: "Quel composant de devis est souvent intégré aux prix d'achat et de vente ?",
    es: "¿Qué componente de cotización suele integrarse en precios de compra y venta?",
    c: "Spread",
    cf: "Spread",
    cs: "Spread",
    w: ["Fee", "Gas"],
    wf: ["Frais", "Gas"],
    ws: ["Tarifa", "Gas"],
    x: "The spread is the difference between quoted buy and sell pricing; it can matter even when a fee looks small."
  },
  {
    id: "squig-certified-003",
    category: "Custody",
    en: "Which custody model means the platform controls keys until withdrawal?",
    fr: "Quel modèle de garde signifie que la plateforme contrôle les clés jusqu'au retrait ?",
    es: "¿Qué modelo de custodia significa que la plataforma controla llaves hasta retiro?",
    c: "Custodial",
    cf: "Custodial",
    cs: "Custodial",
    w: ["Hosted", "Managed"],
    wf: ["Hébergé", "Géré"],
    ws: ["Alojado", "Gestionado"],
    x: "Custodial accounts credit users internally while the service controls private keys."
  },
  {
    id: "squig-certified-004",
    category: "Self-Custody",
    en: "Which custody model puts recovery responsibility on the user?",
    fr: "Quel modèle de garde place la responsabilité de récupération sur l'utilisateur ?",
    es: "¿Qué modelo de custodia pone la recuperación en manos del usuario?",
    c: "Self",
    cf: "Auto",
    cs: "Propia",
    w: ["Manual", "Private"],
    wf: ["Manuel", "Privé"],
    ws: ["Manual", "Privada"],
    x: "Self-custody gives control but also makes backup and signing discipline the user's job."
  },
  {
    id: "squig-certified-005",
    category: "Withdrawals",
    en: "Which tiny transfer can reduce risk before moving a larger balance?",
    fr: "Quel petit transfert réduit le risque avant de déplacer un gros solde ?",
    es: "¿Qué transferencia pequeña reduce riesgo antes de mover un saldo grande?",
    c: "Test",
    cf: "Test",
    cs: "Prueba",
    w: ["Probe", "Ping"],
    wf: ["Sonde", "Ping"],
    ws: ["Sonda", "Ping"],
    x: "A small test transfer can confirm the destination and chain before sending more, though it costs extra fees."
  },
  {
    id: "squig-certified-006",
    category: "Withdrawals",
    en: "Which withdrawal field chooses the destination chain rather than the recipient?",
    fr: "Quel champ de retrait choisit la chaîne destinataire plutôt que le destinataire ?",
    es: "¿Qué campo de retiro elige la cadena destino en vez del destinatario?",
    c: "Network",
    cf: "Réseau",
    cs: "Red",
    w: ["Address", "Amount"],
    wf: ["Adresse", "Montant"],
    ws: ["Dirección", "Monto"],
    x: "The chain selection and recipient address both matter; choosing the wrong chain can make funds hard to access."
  },
  {
    id: "squig-certified-007",
    category: "Token Standards",
    en: "Which standard usually describes single unique collectibles?",
    fr: "Quel standard décrit généralement des collectibles uniques individuels ?",
    es: "¿Qué estándar suele describir coleccionables únicos individuales?",
    c: "ERC721",
    cf: "ERC721",
    cs: "ERC721",
    w: ["ERC20", "ERC1155"],
    wf: ["ERC20", "ERC1155"],
    ws: ["ERC20", "ERC1155"],
    x: "ERC-721 is the common standard for individually unique NFTs."
  },
  {
    id: "squig-certified-008",
    category: "Token Standards",
    en: "Which standard often supports semi-fungible batches?",
    fr: "Quel standard prend souvent en charge des lots semi-fongibles ?",
    es: "¿Qué estándar suele admitir lotes semifungibles?",
    c: "ERC1155",
    cf: "ERC1155",
    cs: "ERC1155",
    w: ["ERC721", "ERC20"],
    wf: ["ERC721", "ERC20"],
    ws: ["ERC721", "ERC20"],
    x: "ERC-1155 can represent multiple token IDs and editions under one contract."
  },
  {
    id: "squig-certified-009",
    category: "Backups",
    en: "Which recovery secret should be offline instead of screenshotted?",
    fr: "Quel secret de récupération doit rester hors ligne plutôt qu'en capture ?",
    es: "¿Qué secreto de recuperación debe estar fuera de línea en vez de capturado?",
    c: "Seed",
    cf: "Seed",
    cs: "Seed",
    w: ["Password", "Address"],
    wf: ["Passe", "Adresse"],
    ws: ["Clave", "Dirección"],
    x: "A seed phrase should be backed up securely offline, not stored in screenshots or cloud notes."
  },
  {
    id: "squig-certified-010",
    category: "Connections",
    en: "Which app request usually shares public account info before transactions?",
    fr: "Quelle demande d'app partage généralement les infos publiques avant les transactions ?",
    es: "¿Qué solicitud de app suele compartir información pública antes de transacciones?",
    c: "Connect",
    cf: "Connecter",
    cs: "Conectar",
    w: ["Sign", "Approve"],
    wf: ["Signer", "Approuver"],
    ws: ["Firmar", "Aprobar"],
    x: "Connecting usually shares a public address; signing or approving is a separate step."
  },
  {
    id: "squig-certified-011",
    category: "Permissions",
    en: "Which wallet request can grant future transfer permission?",
    fr: "Quelle demande peut accorder une permission de transfert future ?",
    es: "¿Qué solicitud puede conceder permiso de transferencia futura?",
    c: "Approval",
    cf: "Approbation",
    cs: "Aprobación",
    w: ["Login", "Message"],
    wf: ["Login", "Message"],
    ws: ["Login", "Mensaje"],
    x: "Approvals can allow a contract to move assets later under marketplace or app rules."
  },
  {
    id: "squig-certified-012",
    category: "Scams",
    en: "Which scam pattern pushes action with fake deadlines?",
    fr: "Quel schéma d'arnaque pousse l'action avec de faux délais ?",
    es: "¿Qué patrón de estafa empuja acción con plazos falsos?",
    c: "Urgency",
    cf: "Urgence",
    cs: "Urgencia",
    w: ["Volume", "Volatility"],
    wf: ["Volume", "Volatilité"],
    ws: ["Volumen", "Volatilidad"],
    x: "Urgency is a common phishing pressure tactic; real checks can survive a pause."
  },
  {
    id: "squig-certified-013",
    category: "Wallet Prompts",
    en: "Which habit compares the final popup against the intended action?",
    fr: "Quelle habitude compare la fenêtre finale avec l'action prévue ?",
    es: "¿Qué hábito compara la ventana final con la acción prevista?",
    c: "Review",
    cf: "Revoir",
    cs: "Revisar",
    w: ["Refresh", "Index"],
    wf: ["Rafraîchir", "Indexer"],
    ws: ["Refrescar", "Indexar"],
    x: "Reviewing the site, action, asset, amount, and chain helps avoid bad signatures."
  },
  {
    id: "squig-certified-014",
    category: "Token Identity",
    en: "Which number identifies a specific item inside its contract?",
    fr: "Quel numéro identifie un item précis dans son contrat ?",
    es: "¿Qué número identifica un ítem específico dentro de su contrato?",
    c: "TokenID",
    cf: "TokenID",
    cs: "TokenID",
    w: ["Serial", "Rarity"],
    wf: ["Série", "Rareté"],
    ws: ["Serie", "Rareza"],
    x: "An NFT is commonly identified by contract plus token ID."
  },
  {
    id: "squig-certified-015",
    category: "Metadata",
    en: "Which data describes image, name, and traits?",
    fr: "Quelle donnée décrit image, nom et traits ?",
    es: "¿Qué dato describe imagen, nombre y rasgos?",
    c: "Metadata",
    cf: "Métadonnées",
    cs: "Metadatos",
    w: ["Provenance", "Manifest"],
    wf: ["Provenance", "Manifeste"],
    ws: ["Procedencia", "Manifiesto"],
    x: "Metadata describes or points to the media and attributes associated with an NFT."
  },
  {
    id: "squig-certified-016",
    category: "Explorers",
    en: "Which public page helps inspect contracts and transfers?",
    fr: "Quelle page publique aide à inspecter contrats et transferts ?",
    es: "¿Qué página pública ayuda a inspeccionar contratos y movimientos?",
    c: "Explorer",
    cf: "Explorer",
    cs: "Explorer",
    w: ["Marketplace", "Wallet"],
    wf: ["Marketplace", "Wallet"],
    ws: ["Marketplace", "Wallet"],
    x: "A block explorer is the independent place to inspect public on-chain records."
  },
  {
    id: "squig-certified-017",
    category: "Official Sources",
    en: "Which item should be bookmarked instead of clicked from ads?",
    fr: "Quel élément doit être favorisé en marque-page plutôt que depuis les pubs ?",
    es: "¿Qué elemento debe guardarse en favoritos en vez de abrirse desde anuncios?",
    c: "Link",
    cf: "Lien",
    cs: "Enlace",
    w: ["Domain", "Banner"],
    wf: ["Domaine", "Bannière"],
    ws: ["Dominio", "Banner"],
    x: "Known project links are safer than sponsored results, DMs, or copied lookalike domains."
  },
  {
    id: "squig-certified-018",
    category: "Fees",
    en: "Which value can spike when many users transact at once?",
    fr: "Quelle valeur peut grimper quand beaucoup d'utilisateurs transigent ensemble ?",
    es: "¿Qué valor puede subir cuando muchos usuarios transaccionan a la vez?",
    c: "Gas",
    cf: "Gas",
    cs: "Gas",
    w: ["Floor", "Spread"],
    wf: ["Floor", "Spread"],
    ws: ["Floor", "Spread"],
    x: "Gas fees rise and fall with network demand."
  },
  {
    id: "squig-certified-019",
    category: "Advanced Routes",
    en: "Which route should a new buyer avoid until basics are mastered?",
    fr: "Quelle route un nouvel acheteur doit éviter avant de maîtriser les bases ?",
    es: "¿Qué ruta debería evitar un comprador nuevo hasta dominar lo básico?",
    c: "Bridge",
    cf: "Bridge",
    cs: "Bridge",
    w: ["Swap", "Mint"],
    wf: ["Swap", "Mint"],
    ws: ["Swap", "Mint"],
    x: "Bridges add contract, chain, and recovery complexity beyond a simple buy flow."
  },
  {
    id: "squig-certified-020",
    category: "Risk Limits",
    en: "Which rule caps spend to survivable loss?",
    fr: "Quelle règle limite la dépense à une perte supportable ?",
    es: "¿Qué regla limita el gasto a una pérdida soportable?",
    c: "Budget",
    cf: "Budget",
    cs: "Presupuesto",
    w: ["Target", "Limit"],
    wf: ["Cible", "Limite"],
    ws: ["Objetivo", "Límite"],
    x: "A risk budget keeps learning from becoming financial damage."
  },
  {
    id: "squig-deep-001",
    category: "Marketplace Flow",
    en: "Which action accepts a seller's current asking price?",
    fr: "Quelle action accepte le prix demandé actuel du vendeur ?",
    es: "¿Qué acción acepta el precio pedido actual del vendedor?",
    c: "Buy",
    cf: "Acheter",
    cs: "Comprar",
    w: ["Bid", "List"],
    wf: ["Enchérir", "Lister"],
    ws: ["Pujar", "Listar"],
    x: "Buying accepts an existing listing; bidding or listing creates a different order."
  },
  {
    id: "squig-deep-002",
    category: "Offers",
    en: "Which action proposes a price the owner may accept?",
    fr: "Quelle action propose un prix que le propriétaire peut accepter ?",
    es: "¿Qué acción propone un precio que el dueño puede aceptar?",
    c: "Offer",
    cf: "Offre",
    cs: "Oferta",
    w: ["Listing", "Cart"],
    wf: ["Listing", "Panier"],
    ws: ["Listing", "Carrito"],
    x: "An offer is buyer-initiated and can be accepted, ignored, canceled, or expire."
  },
  {
    id: "squig-deep-003",
    category: "Offer Funds",
    en: "Which wrapped token is commonly required for marketplace offers?",
    fr: "Quel token emballé est souvent requis pour les offres marketplace ?",
    es: "¿Qué token envuelto suele requerirse para ofertas de marketplace?",
    c: "WETH",
    cf: "WETH",
    cs: "WETH",
    w: ["ETH", "USDC"],
    wf: ["ETH", "USDC"],
    ws: ["ETH", "USDC"],
    x: "Many marketplace offer systems use WETH so contracts can handle the funds if an offer is accepted."
  },
  {
    id: "squig-deep-004",
    category: "Orders",
    en: "Which order state can still execute until canceled or expired?",
    fr: "Quel état d'ordre peut encore s'exécuter avant annulation ou expiration ?",
    es: "¿Qué estado de orden aún puede ejecutarse hasta cancelación o vencimiento?",
    c: "Active",
    cf: "Actif",
    cs: "Activo",
    w: ["Cached", "Pending"],
    wf: ["Cache", "Attente"],
    ws: ["Cache", "Pendiente"],
    x: "Active listings and offers can remain fillable until their rules end them."
  },
  {
    id: "squig-deep-005",
    category: "Selling",
    en: "Which cancellation action removes a posted sale order?",
    fr: "Quelle action d'annulation retire un ordre de vente publié ?",
    es: "¿Qué acción de cancelación retira una orden de venta publicada?",
    c: "Delist",
    cf: "Delister",
    cs: "Delistar",
    w: ["Revoke", "Hide"],
    wf: ["Révoquer", "Cacher"],
    ws: ["Revocar", "Ocultar"],
    x: "Delisting cancels the sale order; hiding an item does not cancel a fillable order."
  },
  {
    id: "squig-deep-006",
    category: "Approvals",
    en: "Which cleanup action removes old contract access?",
    fr: "Quelle action de nettoyage retire un ancien accès contrat ?",
    es: "¿Qué acción de limpieza retira antiguo acceso de contrato?",
    c: "Revoke",
    cf: "Révoquer",
    cs: "Revocar",
    w: ["Cancel", "Delist"],
    wf: ["Annuler", "Delister"],
    ws: ["Cancelar", "Delistar"],
    x: "Revoking removes permissions; canceling and delisting handle orders."
  },
  {
    id: "squig-deep-007",
    category: "Creator Fees",
    en: "Which fee category may pay creators on secondary sales?",
    fr: "Quelle catégorie de frais peut payer les créateurs sur ventes secondaires ?",
    es: "¿Qué categoría de tarifa puede pagar creadores en ventas secundarias?",
    c: "Royalty",
    cf: "Redevance",
    cs: "Royalty",
    w: ["Gas", "Spread"],
    wf: ["Gas", "Spread"],
    ws: ["Gas", "Spread"],
    x: "Royalties depend on marketplace support and rules; they are not the same as network fees."
  },
  {
    id: "squig-deep-008",
    category: "Traits",
    en: "Which trait measure means fewer items share an attribute?",
    fr: "Quelle mesure de trait signifie que moins d'items partagent un attribut ?",
    es: "¿Qué medida de rasgo significa que menos ítems comparten un atributo?",
    c: "Rarity",
    cf: "Rareté",
    cs: "Rareza",
    w: ["Floor", "Rank"],
    wf: ["Floor", "Rang"],
    ws: ["Floor", "Rango"],
    x: "Rarity describes scarcity within a set of traits, not guaranteed value."
  },
  {
    id: "squig-deep-009",
    category: "Pricing",
    en: "Which market number is the lowest current listing, not a guaranteed exit?",
    fr: "Quel nombre de marché est la vente actuelle la plus basse, pas une sortie garantie ?",
    es: "¿Qué número de mercado es la venta actual más baja, no una salida garantizada?",
    c: "Floor",
    cf: "Floor",
    cs: "Floor",
    w: ["Bid", "Volume"],
    wf: ["Bid", "Volume"],
    ws: ["Bid", "Volumen"],
    x: "A floor price is a snapshot of current listings and can change before a sale happens."
  },
  {
    id: "squig-deep-010",
    category: "Market Activity",
    en: "Which signal shows recent trading activity rather than safety?",
    fr: "Quel signal montre l'activité récente plutôt que la sécurité ?",
    es: "¿Qué señal muestra actividad reciente en vez de seguridad?",
    c: "Volume",
    cf: "Volume",
    cs: "Volumen",
    w: ["Floor", "Rarity"],
    wf: ["Floor", "Rareté"],
    ws: ["Floor", "Rareza"],
    x: "Volume can show activity, but it does not prove quality, safety, or future demand."
  },
  {
    id: "squig-deep-011",
    category: "Transfers",
    en: "Which holder action moves item control to another destination?",
    fr: "Quelle action du détenteur déplace le contrôle d'un item vers une autre destination ?",
    es: "¿Qué acción del titular mueve el control de un ítem a otro destino?",
    c: "Transfer",
    cf: "Transfert",
    cs: "Transferir",
    w: ["Listing", "Offer"],
    wf: ["Listing", "Offre"],
    ws: ["Listing", "Oferta"],
    x: "A transfer changes possession; a listing or offer is only an order until filled."
  },
  {
    id: "squig-deep-012",
    category: "Pending State",
    en: "Which transaction state waits before block inclusion?",
    fr: "Quel état de transaction attend avant l'inclusion en bloc ?",
    es: "¿Qué estado de transacción espera antes de inclusión en bloque?",
    c: "Pending",
    cf: "Attente",
    cs: "Pendiente",
    w: ["Queued", "Indexed"],
    wf: ["Queue", "Indexé"],
    ws: ["Cola", "Indexado"],
    x: "Pending transactions are not final and can be replaced or fail depending on wallet and chain rules."
  },
  {
    id: "squig-deep-013",
    category: "Transaction Results",
    en: "Which explorer field shows successful completion?",
    fr: "Quel champ d'explorer montre l'achèvement réussi ?",
    es: "¿Qué campo de explorer muestra finalización exitosa?",
    c: "Status",
    cf: "Statut",
    cs: "Estado",
    w: ["Block", "Nonce"],
    wf: ["Bloc", "Nonce"],
    ws: ["Bloque", "Nonce"],
    x: "Transaction status indicates whether the chain accepted or failed the submitted action."
  },
  {
    id: "squig-deep-014",
    category: "Nonce",
    en: "Which wallet field orders account transactions sequentially?",
    fr: "Quel champ ordonne séquentiellement les transactions d'un compte ?",
    es: "¿Qué campo ordena secuencialmente las transacciones de una cuenta?",
    c: "Nonce",
    cf: "Nonce",
    cs: "Nonce",
    w: ["Gas", "Hash"],
    wf: ["Gas", "Hash"],
    ws: ["Gas", "Hash"],
    x: "A nonce orders transactions from the same address and matters when replacing pending actions."
  },
  {
    id: "squig-deep-015",
    category: "Display Lag",
    en: "Which sync issue can show stale balances briefly?",
    fr: "Quel problème de synchronisation peut montrer brièvement des soldes périmés ?",
    es: "¿Qué problema de sincronización puede mostrar saldos obsoletos brevemente?",
    c: "Indexing",
    cf: "Indexation",
    cs: "Indexación",
    w: ["Metadata", "Cache"],
    wf: ["Métadonnées", "Cache"],
    ws: ["Metadatos", "Cache"],
    x: "Indexing delays can affect wallets and marketplaces even when on-chain ownership is already updated."
  },
  {
    id: "squig-deep-016",
    category: "Storage",
    en: "Which storage target should receive valuable Squigs after buying?",
    fr: "Quelle cible de stockage devrait recevoir les Squigs précieux après achat ?",
    es: "¿Qué destino de almacenamiento debería recibir Squigs valiosos tras comprar?",
    c: "Vault",
    cf: "Coffre",
    cs: "Bóveda",
    w: ["Burner", "Hot"],
    wf: ["Burner", "Hot"],
    ws: ["Burner", "Hot"],
    x: "A low-interaction vault wallet reduces exposure after purchase."
  },
  {
    id: "squig-deep-017",
    category: "Risk Isolation",
    en: "Which temporary account should hold only small testing funds?",
    fr: "Quel compte temporaire doit contenir seulement de petits fonds de test ?",
    es: "¿Qué cuenta temporal debería contener solo fondos pequeños de prueba?",
    c: "Burner",
    cf: "Burner",
    cs: "Burner",
    w: ["Vault", "Hardware"],
    wf: ["Coffre", "Hardware"],
    ws: ["Bóveda", "Hardware"],
    x: "A burner wallet limits damage when testing unfamiliar apps."
  },
  {
    id: "squig-deep-018",
    category: "Spam Assets",
    en: "Which attack sends junk assets to lure dangerous clicks?",
    fr: "Quelle attaque envoie des actifs indésirables pour attirer des clics dangereux ?",
    es: "¿Qué ataque envía activos basura para atraer clics peligrosos?",
    c: "Airdrop",
    cf: "Airdrop",
    cs: "Airdrop",
    w: ["Mint", "Spam"],
    wf: ["Mint", "Spam"],
    ws: ["Mint", "Spam"],
    x: "Unwanted airdrops can be phishing bait; avoid links and prompts attached to unknown assets."
  },
  {
    id: "squig-deep-019",
    category: "Source Hygiene",
    en: "Which URL source should beat ads and DMs?",
    fr: "Quelle source d'URL doit battre pubs et messages privés ?",
    es: "¿Qué fuente de URL debería vencer anuncios y mensajes privados?",
    c: "Official",
    cf: "Officiel",
    cs: "Oficial",
    w: ["Sponsored", "Trending"],
    wf: ["Sponsorisé", "Tendance"],
    ws: ["Patrocinado", "Tendencia"],
    x: "Use project-owned sources and saved links instead of sponsored results or unsolicited messages."
  },
  {
    id: "squig-deep-020",
    category: "Buying Flow",
    en: "Which final check compares site, chain, item, price, and fee?",
    fr: "Quelle vérification finale compare site, chaîne, item, prix et frais ?",
    es: "¿Qué revisión final compara sitio, cadena, ítem, precio y tarifa?",
    c: "Review",
    cf: "Revoir",
    cs: "Revisar",
    w: ["Refresh", "Confirm"],
    wf: ["Rafraîchir", "Confirmer"],
    ws: ["Refrescar", "Confirmar"],
    x: "The final wallet review is the last chance to catch a wrong action before signing."
  },
  {
    id: "squig-internal-001",
    category: "Blind Signing",
    en: "Which signing risk means the data is unclear before approval?",
    fr: "Quel risque de signature signifie que les données sont floues avant approbation ?",
    es: "¿Qué riesgo de firma significa que los datos son poco claros antes de aprobar?",
    c: "Blind",
    cf: "Aveugle",
    cs: "Ciega",
    w: ["Typed", "Session", "Permit"],
    wf: ["Typée", "Session", "Permit"],
    ws: ["Tipada", "Sesión", "Permit"],
    x: "Blind signing is dangerous because the user cannot clearly inspect what they are approving."
  },
  {
    id: "squig-internal-002",
    category: "Readable Signing",
    en: "Which signing format improves readability over opaque bytes?",
    fr: "Quel format de signature améliore la lisibilité par rapport aux octets opaques ?",
    es: "¿Qué formato de firma mejora la legibilidad frente a bytes opacos?",
    c: "Typed",
    cf: "Typée",
    cs: "Tipada",
    w: ["Blind", "Raw", "Permit"],
    wf: ["Aveugle", "Brute", "Permit"],
    ws: ["Ciega", "Cruda", "Permit"],
    x: "Typed data can make wallet prompts easier to inspect than raw opaque data."
  },
  {
    id: "squig-internal-003",
    category: "Allowances",
    en: "Which allowance risk lets spenders drain fungible balances?",
    fr: "Quel risque d'allocation laisse des dépensiers vider des soldes fongibles ?",
    es: "¿Qué riesgo de asignación permite vaciar saldos fungibles?",
    c: "Unlimited",
    cf: "Illimité",
    cs: "Ilimitado",
    w: ["Limited", "Revoked", "Expired"],
    wf: ["Limité", "Révoqué", "Expiré"],
    ws: ["Limitado", "Revocado", "Vencido"],
    x: "Unlimited token allowances can remain dangerous if the spender contract is malicious or compromised."
  },
  {
    id: "squig-internal-004",
    category: "NFT Permissions",
    en: "Which permission scope risks many items instead of one?",
    fr: "Quelle portée de permission risque plusieurs items plutôt qu'un seul ?",
    es: "¿Qué alcance de permiso arriesga muchos ítems en vez de uno?",
    c: "Operator",
    cf: "Opérateur",
    cs: "Operador",
    w: ["Token", "Listing", "Royalty"],
    wf: ["Token", "Listing", "Redevance"],
    ws: ["Token", "Listing", "Royalty"],
    x: "Operator permissions can cover a whole contract, so they deserve extra scrutiny."
  },
  {
    id: "squig-internal-005",
    category: "Approval Calls",
    en: "Which standard call can grant access to every item in a contract?",
    fr: "Quel appel standard peut accorder l'accès à chaque item d'un contrat ?",
    es: "¿Qué llamada estándar puede conceder acceso a cada ítem de un contrato?",
    c: "SetApprovalForAll",
    cf: "SetApprovalForAll",
    cs: "SetApprovalForAll",
    w: ["Approve", "Permit", "Transfer"],
    wf: ["Approve", "Permit", "Transfer"],
    ws: ["Approve", "Permit", "Transfer"],
    x: "setApprovalForAll is powerful and should only be granted to trusted marketplace contracts when needed."
  },
  {
    id: "squig-internal-006",
    category: "Order Cancellation",
    en: "Which cancellation layer may require gas after closing browser tabs?",
    fr: "Quelle couche d'annulation peut demander du gas après la fermeture des onglets ?",
    es: "¿Qué capa de cancelación puede requerir gas después de cerrar pestañas?",
    c: "Onchain",
    cf: "Onchain",
    cs: "Onchain",
    w: ["Cache", "Session", "UI"],
    wf: ["Cache", "Session", "UI"],
    ws: ["Cache", "Sesión", "UI"],
    x: "Some cancellations must be settled on-chain; closing a website does not cancel blockchain state."
  },
  {
    id: "squig-internal-007",
    category: "OpenSea Orders",
    en: "Which order system powers many marketplace listing and offer fills?",
    fr: "Quel système d'ordres alimente beaucoup de ventes et d'offres marketplace ?",
    es: "¿Qué sistema de órdenes impulsa muchas ventas y ofertas de marketplace?",
    c: "Seaport",
    cf: "Seaport",
    cs: "Seaport",
    w: ["Wyvern", "Blur", "LooksRare"],
    wf: ["Wyvern", "Blur", "LooksRare"],
    ws: ["Wyvern", "Blur", "LooksRare"],
    x: "Seaport is the order protocol behind many OpenSea listing and offer fills."
  },
  {
    id: "squig-internal-008",
    category: "Order Routing",
    en: "Which permission channel can route asset transfers during fills?",
    fr: "Quel canal de permission peut router les transferts d'actifs pendant l'exécution ?",
    es: "¿Qué canal de permiso puede enrutar transferencias de activos durante ejecuciones?",
    c: "Conduit",
    cf: "Conduit",
    cs: "Conduit",
    w: ["Router", "Proxy", "Escrow"],
    wf: ["Router", "Proxy", "Escrow"],
    ws: ["Router", "Proxy", "Escrow"],
    x: "Marketplace protocols can use conduits to route approved asset transfers."
  },
  {
    id: "squig-internal-009",
    category: "Phishing",
    en: "Which exploit hides malicious approval behind harmless-looking text?",
    fr: "Quel exploit cache une approbation malveillante derrière un texte innocent ?",
    es: "¿Qué explotación esconde una aprobación maliciosa detrás de texto inocente?",
    c: "Phishing",
    cf: "Phishing",
    cs: "Phishing",
    w: ["Spoofing", "Spam", "Impersonation"],
    wf: ["Spoofing", "Spam", "Imitation"],
    ws: ["Spoofing", "Spam", "Imitación"],
    x: "Phishing often disguises dangerous actions as harmless prompts."
  },
  {
    id: "squig-internal-010",
    category: "Wallet Safety",
    en: "Which wallet feature estimates effects before signing?",
    fr: "Quelle fonction de portefeuille estime les effets avant signature ?",
    es: "¿Qué función de cartera estima efectos antes de firmar?",
    c: "Simulation",
    cf: "Simulation",
    cs: "Simulación",
    w: ["Indexing", "Bridging", "Listing"],
    wf: ["Indexation", "Bridge", "Listing"],
    ws: ["Indexación", "Bridge", "Listing"],
    x: "Simulation can help preview likely effects, but users still need to inspect prompts."
  },
  {
    id: "squig-internal-011",
    category: "Key Isolation",
    en: "Which device type keeps keys isolated from the browser?",
    fr: "Quel type d'appareil garde les clés isolées du navigateur ?",
    es: "¿Qué tipo de dispositivo mantiene llaves aisladas del navegador?",
    c: "Hardware",
    cf: "Hardware",
    cs: "Hardware",
    w: ["Mobile", "Desktop", "Vault"],
    wf: ["Mobile", "Desktop", "Coffre"],
    ws: ["Móvil", "Escritorio", "Bóveda"],
    x: "A hardware wallet keeps private keys off the everyday computer or browser."
  },
  {
    id: "squig-internal-012",
    category: "Wallet Types",
    en: "Which account type stays online for daily actions?",
    fr: "Quel type de compte reste en ligne pour les actions quotidiennes ?",
    es: "¿Qué tipo de cuenta permanece en línea para acciones diarias?",
    c: "Hot",
    cf: "Hot",
    cs: "Hot",
    w: ["Cold", "Vault", "Burner"],
    wf: ["Cold", "Coffre", "Burner"],
    ws: ["Cold", "Bóveda", "Burner"],
    x: "Hot wallets are convenient but more exposed to websites and devices."
  },
  {
    id: "squig-internal-013",
    category: "Wallet Types",
    en: "Which storage type stays offline for safer holding?",
    fr: "Quel type de stockage reste hors ligne pour une conservation plus sûre ?",
    es: "¿Qué tipo de almacenamiento permanece fuera de línea para guardar mejor?",
    c: "Cold",
    cf: "Cold",
    cs: "Cold",
    w: ["Vault", "Hardware", "Hot"],
    wf: ["Coffre", "Hardware", "Hot"],
    ws: ["Bóveda", "Hardware", "Hot"],
    x: "Cold storage reduces exposure by keeping signing access away from routine browsing."
  },
  {
    id: "squig-internal-014",
    category: "Cross-Chain",
    en: "Which route adds contract and chain confusion risk?",
    fr: "Quelle route ajoute des risques de contrat et confusion de chaîne ?",
    es: "¿Qué ruta añade riesgo de contrato y confusión de cadena?",
    c: "Bridge",
    cf: "Bridge",
    cs: "Bridge",
    w: ["Network", "Swap", "Router"],
    wf: ["Réseau", "Swap", "Router"],
    ws: ["Red", "Swap", "Router"],
    x: "Bridges connect chains but add technical and security complexity."
  },
  {
    id: "squig-internal-015",
    category: "Records",
    en: "Which practice preserves dates, amounts, fees, and counterparties?",
    fr: "Quelle pratique conserve dates, montants, frais et contreparties ?",
    es: "¿Qué práctica conserva fechas, montos, tarifas y contrapartes?",
    c: "Records",
    cf: "Registres",
    cs: "Registros",
    w: ["Receipts", "Exports", "Notes"],
    wf: ["Reçus", "Exports", "Notes"],
    ws: ["Recibos", "Exports", "Notas"],
    x: "Good records help with personal tracking and possible tax reporting obligations."
  },
  {
    id: "squig-internal-016",
    category: "Approval Hygiene",
    en: "Which review cadence catches old permissions before they rot?",
    fr: "Quelle cadence de revue attrape les anciennes permissions avant la moisissure ?",
    es: "¿Qué cadencia de revisión atrapa permisos viejos antes de pudrirse?",
    c: "Routine",
    cf: "Routine",
    cs: "Rutina",
    w: ["Panic", "Launch", "Trend"],
    wf: ["Panique", "Lancement", "Tendance"],
    ws: ["Pánico", "Lanzamiento", "Tendencia"],
    x: "Routine approval reviews reduce stale permission exposure."
  },
  {
    id: "squig-internal-017",
    category: "Unsafe Requests",
    en: "Which request should be rejected when site and intent are unclear?",
    fr: "Quelle demande doit être rejetée quand site et intention sont flous ?",
    es: "¿Qué solicitud debe rechazarse cuando sitio e intención son confusos?",
    c: "Unknown",
    cf: "Inconnue",
    cs: "Desconocida",
    w: ["Typed", "Login", "Message"],
    wf: ["Typée", "Login", "Message"],
    ws: ["Tipada", "Login", "Mensaje"],
    x: "Unknown signing requests should not be approved just because a site looks polished."
  },
  {
    id: "squig-internal-018",
    category: "Impersonation",
    en: "Which attack copies a project account or domain?",
    fr: "Quelle attaque copie un compte ou domaine de projet ?",
    es: "¿Qué ataque copia una cuenta o dominio de proyecto?",
    c: "Impersonation",
    cf: "Imitation",
    cs: "Imitación",
    w: ["Phishing", "Spoofing", "Spam"],
    wf: ["Phishing", "Spoofing", "Spam"],
    ws: ["Phishing", "Spoofing", "Spam"],
    x: "Impersonation is a common path into phishing, fake support, and unsafe links."
  },
  {
    id: "squig-internal-019",
    category: "Display Lag",
    en: "Which sync problem can delay images while ownership is valid?",
    fr: "Quel problème de synchronisation peut retarder les images malgré une propriété valide ?",
    es: "¿Qué problema de sincronización puede retrasar imágenes aunque la propiedad sea válida?",
    c: "Indexing",
    cf: "Indexation",
    cs: "Indexación",
    w: ["Ownership", "Transfer", "Rarity"],
    wf: ["Propriété", "Transfert", "Rareté"],
    ws: ["Propiedad", "Transferencia", "Rareza"],
    x: "Indexing lag can affect display without changing the on-chain owner."
  },
  {
    id: "squig-internal-020",
    category: "Liquidity",
    en: "Which sale risk means no buyer appears at your desired price?",
    fr: "Quel risque de vente signifie qu'aucun acheteur n'apparaît au prix souhaité ?",
    es: "¿Qué riesgo de venta significa que no aparece comprador al precio deseado?",
    c: "Liquidity",
    cf: "Liquidité",
    cs: "Liquidez",
    w: ["Volatility", "Floor", "Spread"],
    wf: ["Volatilité", "Floor", "Spread"],
    ws: ["Volatilidad", "Floor", "Spread"],
    x: "NFT liquidity can be thin; listed prices do not guarantee immediate buyers."
  },
  {
    id: "squig-impossible-001",
    category: "Nonce Replacement",
    en: "In a stuck purchase replacement, which field prevents both attempts from settling?",
    fr: "Dans un remplacement d'achat bloqué, quel champ empêche deux tentatives de régler ?",
    es: "En un reemplazo de compra atascada, ¿qué campo evita que ambas intentos liquiden?",
    c: "Nonce",
    cf: "Nonce",
    cs: "Nonce",
    w: ["Gas", "Hash", "Status"],
    wf: ["Gas", "Hash", "Statut"],
    ws: ["Gas", "Hash", "Estado"],
    x: "Transactions from the same account with the same nonce replace each other rather than both settling."
  },
  {
    id: "squig-impossible-002",
    category: "Pending Replacement",
    en: "When replacing a pending action, which parameter usually must increase?",
    fr: "Lors du remplacement d'une action en attente, quel paramètre doit généralement augmenter ?",
    es: "Al reemplazar una acción pendiente, ¿qué parámetro suele aumentar?",
    c: "Fee",
    cf: "Frais",
    cs: "Tarifa",
    w: ["Nonce", "Value", "Recipient"],
    wf: ["Nonce", "Valeur", "Destinataire"],
    ws: ["Nonce", "Valor", "Receptor"],
    x: "Replacing or speeding up often requires a higher fee while keeping the nonce relationship clear."
  },
  {
    id: "squig-impossible-003",
    category: "Seaport Orders",
    en: "Which order component defines what the counterparty receives?",
    fr: "Quel composant d'ordre définit ce que reçoit la contrepartie ?",
    es: "¿Qué componente de orden define lo que recibe la contraparte?",
    c: "Consideration",
    cf: "Consideration",
    cs: "Consideration",
    w: ["Offer", "Conduit", "Zone"],
    wf: ["Offer", "Conduit", "Zone"],
    ws: ["Offer", "Conduit", "Zone"],
    x: "In Seaport-style orders, consideration describes what the other side receives."
  },
  {
    id: "squig-impossible-004",
    category: "Seaport Restrictions",
    en: "Which order field can restrict who may fulfill an order?",
    fr: "Quel champ d'ordre peut restreindre qui peut exécuter un ordre ?",
    es: "¿Qué campo de orden puede restringir quién puede ejecutar una orden?",
    c: "Zone",
    cf: "Zone",
    cs: "Zone",
    w: ["Conduit", "Offer", "Salt"],
    wf: ["Conduit", "Offer", "Salt"],
    ws: ["Conduit", "Offer", "Salt"],
    x: "Advanced order fields can add restrictions beyond simple price and item matching."
  },
  {
    id: "squig-impossible-005",
    category: "Permit Signing",
    en: "Which EIP pattern signs token allowance without a separate approve transaction?",
    fr: "Quel modèle EIP signe une allocation de token sans transaction approve séparée ?",
    es: "¿Qué patrón EIP firma una asignación de token sin transacción approve separada?",
    c: "Permit",
    cf: "Permit",
    cs: "Permit",
    w: ["Approval", "Signature", "Allowance"],
    wf: ["Approbation", "Signature", "Allocation"],
    ws: ["Aprobación", "Firma", "Asignación"],
    x: "Permit-style flows can authorize token movement by signature, so they still require careful review."
  },
  {
    id: "squig-impossible-006",
    category: "Delegation",
    en: "Which account feature can delegate limited actions temporarily?",
    fr: "Quelle fonction de compte peut déléguer temporairement des actions limitées ?",
    es: "¿Qué función de cuenta puede delegar acciones limitadas temporalmente?",
    c: "Sessionkey",
    cf: "Sessionkey",
    cs: "Sessionkey",
    w: ["Signature", "Approval", "Nonce"],
    wf: ["Signature", "Approbation", "Nonce"],
    ws: ["Firma", "Aprobación", "Nonce"],
    x: "Session keys are an advanced account pattern for limited delegated actions."
  },
  {
    id: "squig-impossible-007",
    category: "On-Chain Proof",
    en: "Which public signal proves an item moved even if the marketplace UI lags?",
    fr: "Quel signal public prouve qu'un item a bougé même si l'interface tarde ?",
    es: "¿Qué señal pública prueba que un ítem se movió aunque la interfaz tarde?",
    c: "Event",
    cf: "Événement",
    cs: "Evento",
    w: ["Metadata", "Cache", "Rank"],
    wf: ["Métadonnées", "Cache", "Rang"],
    ws: ["Metadatos", "Cache", "Rango"],
    x: "Contract events can show movement before marketplaces finish indexing."
  },
  {
    id: "squig-impossible-008",
    category: "Events",
    en: "Which event name usually records ownership movement for NFTs?",
    fr: "Quel nom d'événement enregistre généralement le mouvement de propriété NFT ?",
    es: "¿Qué nombre de evento suele registrar movimiento de propiedad NFT?",
    c: "Transfer",
    cf: "Transfer",
    cs: "Transfer",
    w: ["Approval", "Order", "Fulfill"],
    wf: ["Approval", "Order", "Fulfill"],
    ws: ["Approval", "Order", "Fulfill"],
    x: "Transfer events are the standard signal for token ownership movement."
  },
  {
    id: "squig-impossible-009",
    category: "Interfaces",
    en: "Which interface standard helps contracts declare supported functions?",
    fr: "Quel standard d'interface aide les contrats à déclarer les fonctions supportées ?",
    es: "¿Qué estándar de interfaz ayuda a contratos a declarar funciones soportadas?",
    c: "ERC165",
    cf: "ERC165",
    cs: "ERC165",
    w: ["ERC721", "ERC20", "ERC1155"],
    wf: ["ERC721", "ERC20", "ERC1155"],
    ws: ["ERC721", "ERC20", "ERC1155"],
    x: "ERC-165 lets contracts advertise interface support so apps can inspect capabilities."
  },
  {
    id: "squig-impossible-010",
    category: "Hardware Limits",
    en: "Which risk remains after secure-device signing if intent is misunderstood?",
    fr: "Quel risque reste après signature sur appareil sûr si l'intention est mal comprise ?",
    es: "¿Qué riesgo queda tras firmar con dispositivo seguro si se malentiende la intención?",
    c: "Phishing",
    cf: "Phishing",
    cs: "Phishing",
    w: ["Custody", "Volatility", "Liquidity"],
    wf: ["Garde", "Volatilité", "Liquidité"],
    ws: ["Custodia", "Volatilidad", "Liquidez"],
    x: "Hardware wallets protect keys, but users can still approve a malicious action."
  },
  {
    id: "squig-impossible-011",
    category: "Offer Currency",
    en: "Which bid currency can execute later while the offer remains active?",
    fr: "Quelle devise d'offre peut s'exécuter plus tard tant que l'offre reste active ?",
    es: "¿Qué moneda de oferta puede ejecutarse luego mientras la oferta sigue activa?",
    c: "WETH",
    cf: "WETH",
    cs: "WETH",
    w: ["ETH", "USDC", "DAI"],
    wf: ["ETH", "USDC", "DAI"],
    ws: ["ETH", "USDC", "DAI"],
    x: "WETH offers can remain active and fill later if not canceled or expired."
  },
  {
    id: "squig-impossible-012",
    category: "Offer Review",
    en: "Which value should match the wallet popup before accepting an offer?",
    fr: "Quelle valeur doit correspondre dans la fenêtre avant d'accepter une offre ?",
    es: "¿Qué valor debe coincidir en la ventana antes de aceptar una oferta?",
    c: "Currency",
    cf: "Devise",
    cs: "Moneda",
    w: ["Floor", "Rarity", "Volume"],
    wf: ["Floor", "Rareté", "Volume"],
    ws: ["Floor", "Rareza", "Volumen"],
    x: "A large-looking offer in the wrong currency can be a costly mistake."
  },
  {
    id: "squig-impossible-013",
    category: "Forgotten Orders",
    en: "Which state can leave an old sale fillable after being forgotten?",
    fr: "Quel état peut laisser une ancienne vente exécutable après oubli ?",
    es: "¿Qué estado puede dejar una venta antigua ejecutable tras olvidarse?",
    c: "Active",
    cf: "Actif",
    cs: "Activo",
    w: ["Cached", "Indexed", "Hidden"],
    wf: ["Cache", "Indexé", "Caché"],
    ws: ["Cache", "Indexado", "Oculto"],
    x: "If an order is still active, forgetting it does not cancel it."
  },
  {
    id: "squig-impossible-014",
    category: "Wallet Separation",
    en: "Which practice uses one public account for identity and another for storage?",
    fr: "Quelle pratique utilise un compte public pour l'identité et un autre pour stockage ?",
    es: "¿Qué práctica usa una cuenta pública para identidad y otra para guardar?",
    c: "Separation",
    cf: "Séparation",
    cs: "Separación",
    w: ["Rotation", "Delegation", "Compartment"],
    wf: ["Rotation", "Délégation", "Compartiment"],
    ws: ["Rotación", "Delegación", "Compartimento"],
    x: "Separating public identity and vault storage reduces privacy and signing exposure."
  },
  {
    id: "squig-impossible-015",
    category: "Shared Devices",
    en: "Which risk increases when browser wallets run on public machines?",
    fr: "Quel risque augmente quand des portefeuilles navigateur tournent sur machines publiques ?",
    es: "¿Qué riesgo aumenta cuando carteras de navegador corren en máquinas públicas?",
    c: "Session",
    cf: "Session",
    cs: "Sesión",
    w: ["Hardware", "Network", "Slippage"],
    wf: ["Hardware", "Réseau", "Slippage"],
    ws: ["Hardware", "Red", "Slippage"],
    x: "Shared devices can expose sessions, extensions, screens, and sensitive activity."
  },
  {
    id: "squig-impossible-016",
    category: "Final Confirmation",
    en: "Which habit catches wrong asset, chain, price, and permission together?",
    fr: "Quelle habitude attrape mauvais actif, chaîne, prix et permission ensemble ?",
    es: "¿Qué hábito atrapa activo, cadena, precio y permiso incorrectos juntos?",
    c: "Review",
    cf: "Revoir",
    cs: "Revisar",
    w: ["Pause", "Research", "Wait"],
    wf: ["Pause", "Recherche", "Attendre"],
    ws: ["Pausa", "Investigar", "Esperar"],
    x: "A final review is the active checklist after the pause and before signing."
  },
  {
    id: "squig-impossible-017",
    category: "Public Ledgers",
    en: "Which principle lets ownership be visible while recovery secrets stay hidden?",
    fr: "Quel principe rend la propriété visible tandis que les secrets restent cachés ?",
    es: "¿Qué principio permite propiedad visible mientras secretos quedan ocultos?",
    c: "Transparency",
    cf: "Transparence",
    cs: "Transparencia",
    w: ["Privacy", "Custody", "Identity"],
    wf: ["Confidentialité", "Garde", "Identité"],
    ws: ["Privacidad", "Custodia", "Identidad"],
    x: "Public ledgers expose addresses and balances without needing seed phrases."
  },
  {
    id: "squig-impossible-018",
    category: "NFT Liquidity",
    en: "Which asset property makes exits harder than token swaps?",
    fr: "Quelle propriété d'actif rend les sorties plus dures que les swaps de tokens ?",
    es: "¿Qué propiedad del activo hace salidas más difíciles que swaps de tokens?",
    c: "Uniqueness",
    cf: "Unicité",
    cs: "Unicidad",
    w: ["Rarity", "Floor", "Traits"],
    wf: ["Rareté", "Floor", "Traits"],
    ws: ["Rareza", "Floor", "Rasgos"],
    x: "Each NFT is distinct, so selling requires a buyer who wants that specific item at that price."
  },
  {
    id: "squig-impossible-019",
    category: "Support Scams",
    en: "Which action fits when support requests recovery words?",
    fr: "Quelle action convient quand le support demande les mots de récupération ?",
    es: "¿Qué acción corresponde cuando soporte pide palabras de recuperación?",
    c: "Refuse",
    cf: "Refuser",
    cs: "Rechazar",
    w: ["Verify", "Delay", "Escalate"],
    wf: ["Vérifier", "Retarder", "Escalader"],
    ws: ["Verificar", "Demorar", "Escalar"],
    x: "Real support does not need a seed phrase; sharing it can hand over the wallet."
  },
  {
    id: "squig-impossible-020",
    category: "No Guarantees",
    en: "Which outcome is never promised by responsible Squig onboarding?",
    fr: "Quel résultat n'est jamais promis par un onboarding Squig responsable ?",
    es: "¿Qué resultado nunca promete un onboarding Squig responsable?",
    c: "Profit",
    cf: "Profit",
    cs: "Ganancia",
    w: ["Safety", "Education", "Access"],
    wf: ["Sécurité", "Éducation", "Accès"],
    ws: ["Seguridad", "Educación", "Acceso"],
    x: "This is education and safety practice, not financial advice or a promise of returns."
  }
].map((entry) => [entry.id, upgradeQuestion(entry)]));

function hardenQuestion(question) {
  const upgrade = QUESTION_UPGRADES.get(question.id);
  return upgrade ? { ...question, ...upgrade } : question;
}

const QUESTIONS = RAW_QUESTIONS.map((question) => q(hardenQuestion(question)));

function answerWordCount(value) {
  const text = String(value || "").trim();
  if (!text) return 0;
  return text.split(/\s+/u).length;
}

function normalizeAnswerLabel(value) {
  return String(value || "").trim().toLocaleLowerCase("en-US").replace(/\s+/g, " ");
}

function promptIncludesAnswer(prompt, answer) {
  const normalizedAnswer = normalizeAnswerLabel(answer);
  if (!normalizedAnswer) return false;
  const words = String(prompt || "")
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}$]+/gu) || [];
  return words.includes(normalizedAnswer);
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
        if (promptIncludesAnswer(localized.prompt, localized.correct)) {
          errors.push(`${question.id} i18n.${language}.prompt includes the correct answer "${localized.correct}"`);
        }
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
          if (wordCount !== 1) {
            errors.push(`${question.id} i18n.${language} answer "${label}" must be exactly 1 word`);
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

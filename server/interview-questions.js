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

const QUESTIONS = RAW_QUESTIONS.map(q);

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

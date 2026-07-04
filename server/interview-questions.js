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
      "Gas"
    ],
    "correctRoast": "Correct. Fiat survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Fiat money is government-issued currency, often used first before buying crypto.",
    "i18n": {
      "en": {
        "prompt": "What do people usually start with before using a crypto on-ramp?",
        "correct": "Fiat",
        "wrong": [
          "Gas"
        ]
      },
      "fr": {
        "prompt": "Avec quoi commence-t-on généralement avant d'utiliser une rampe crypto ?",
        "correct": "Fiat",
        "wrong": [
          "Gas"
        ]
      },
      "es": {
        "prompt": "¿Con qué suele empezar alguien antes de usar una rampa cripto?",
        "correct": "Fiat",
        "wrong": [
          "Gas"
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
      "Explorer"
    ],
    "correctRoast": "Correct. Exchange survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A centralized exchange is a common beginner on-ramp from fiat into crypto.",
    "i18n": {
      "en": {
        "prompt": "Which service commonly turns regular money into crypto?",
        "correct": "Exchange",
        "wrong": [
          "Explorer"
        ]
      },
      "fr": {
        "prompt": "Quel service transforme souvent l'argent classique en crypto ?",
        "correct": "Exchange",
        "wrong": [
          "Explorer"
        ]
      },
      "es": {
        "prompt": "¿Qué servicio suele convertir dinero normal en cripto?",
        "correct": "Exchange",
        "wrong": [
          "Explorer"
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
      "NFT"
    ],
    "correctRoast": "Correct. ETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "ETH is used to pay Ethereum network fees and often NFT purchase prices.",
    "i18n": {
      "en": {
        "prompt": "Which asset usually pays transaction fees on Ethereum?",
        "correct": "ETH",
        "wrong": [
          "NFT"
        ]
      },
      "fr": {
        "prompt": "Quel actif paie généralement les frais de transaction sur Ethereum ?",
        "correct": "ETH",
        "wrong": [
          "NFT"
        ]
      },
      "es": {
        "prompt": "¿Qué activo suele pagar las tarifas de transacción en Ethereum?",
        "correct": "ETH",
        "wrong": [
          "NFT"
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
      "Browser"
    ],
    "correctRoast": "Correct. Wallet survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A wallet manages keys and lets the holder control on-chain assets.",
    "i18n": {
      "en": {
        "prompt": "What tool controls blockchain assets with keys?",
        "correct": "Wallet",
        "wrong": [
          "Browser"
        ]
      },
      "fr": {
        "prompt": "Quel outil contrôle les actifs blockchain avec des clés ?",
        "correct": "Wallet",
        "wrong": [
          "Navigateur"
        ]
      },
      "es": {
        "prompt": "¿Qué herramienta controla activos blockchain con llaves?",
        "correct": "Wallet",
        "wrong": [
          "Navegador"
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
      "Address"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A seed phrase can restore and control a wallet, so it should never be shared.",
    "i18n": {
      "en": {
        "prompt": "Which wallet item must stay private forever?",
        "correct": "Seed",
        "wrong": [
          "Address"
        ]
      },
      "fr": {
        "prompt": "Quel élément du wallet doit rester privé pour toujours ?",
        "correct": "Seed",
        "wrong": [
          "Adresse"
        ]
      },
      "es": {
        "prompt": "¿Qué elemento del wallet debe quedar privado para siempre?",
        "correct": "Semilla",
        "wrong": [
          "Dirección"
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
      "Seed"
    ],
    "correctRoast": "Correct. Address survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A public address can receive assets; private recovery secrets must stay hidden.",
    "i18n": {
      "en": {
        "prompt": "Which wallet item can be shared to receive assets?",
        "correct": "Address",
        "wrong": [
          "Seed"
        ]
      },
      "fr": {
        "prompt": "Quel élément du wallet peut être partagé pour recevoir des actifs ?",
        "correct": "Adresse",
        "wrong": [
          "Seed"
        ]
      },
      "es": {
        "prompt": "¿Qué elemento del wallet puede compartirse para recibir activos?",
        "correct": "Dirección",
        "wrong": [
          "Semilla"
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
      "Royalty"
    ],
    "correctRoast": "Correct. Gas survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Gas is the network fee paid to process activity on Ethereum.",
    "i18n": {
      "en": {
        "prompt": "What pays validators to process an Ethereum transaction?",
        "correct": "Gas",
        "wrong": [
          "Royalty"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui paie les validateurs pour traiter une transaction Ethereum ?",
        "correct": "Gas",
        "wrong": [
          "Royalty"
        ]
      },
      "es": {
        "prompt": "¿Qué paga a validadores por procesar una transacción de Ethereum?",
        "correct": "Gas",
        "wrong": [
          "Regalía"
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
      "JPEG"
    ],
    "correctRoast": "Correct. NFT survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "An NFT is a unique token that can represent ownership or access for a collectible.",
    "i18n": {
      "en": {
        "prompt": "What unique on-chain item can represent a collectible?",
        "correct": "NFT",
        "wrong": [
          "JPEG"
        ]
      },
      "fr": {
        "prompt": "Quel élément unique on-chain peut représenter un collectible ?",
        "correct": "NFT",
        "wrong": [
          "JPEG"
        ]
      },
      "es": {
        "prompt": "¿Qué elemento único on-chain puede representar un coleccionable?",
        "correct": "NFT",
        "wrong": [
          "JPEG"
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
      "Spreadsheet"
    ],
    "correctRoast": "Correct. Blockchain survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A blockchain is a shared ledger maintained and verified by a network.",
    "i18n": {
      "en": {
        "prompt": "What shared record stores verified transactions?",
        "correct": "Blockchain",
        "wrong": [
          "Spreadsheet"
        ]
      },
      "fr": {
        "prompt": "Quel registre partagé stocke les transactions vérifiées ?",
        "correct": "Blockchain",
        "wrong": [
          "Tableur"
        ]
      },
      "es": {
        "prompt": "¿Qué registro compartido guarda transacciones verificadas?",
        "correct": "Blockchain",
        "wrong": [
          "Planilla"
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
      "Notepad"
    ],
    "correctRoast": "Correct. Marketplace survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "NFT marketplaces show collections, listings, offers, and purchase flows.",
    "i18n": {
      "en": {
        "prompt": "Where do buyers usually browse listed collectibles?",
        "correct": "Marketplace",
        "wrong": [
          "Notepad"
        ]
      },
      "fr": {
        "prompt": "Où les acheteurs consultent-ils généralement les collectibles listés ?",
        "correct": "Marketplace",
        "wrong": [
          "Blocnote"
        ]
      },
      "es": {
        "prompt": "¿Dónde suelen mirar los compradores coleccionables listados?",
        "correct": "Marketplace",
        "wrong": [
          "Bloc"
        ]
      }
    }
  },
  {
    "id": "squig-easy-012",
    "tier": 1,
    "category": "Verification",
    "prompt": "What on-chain identifier is harder to fake than a collection name?",
    "correct": "Contract",
    "wrong": [
      "Logo"
    ],
    "correctRoast": "Correct. Contract survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A contract address identifies the real on-chain collection more reliably than a copied name.",
    "i18n": {
      "en": {
        "prompt": "What on-chain identifier is harder to fake than a collection name?",
        "correct": "Contract",
        "wrong": [
          "Logo"
        ]
      },
      "fr": {
        "prompt": "Quel identifiant on-chain est plus difficile à copier qu'un nom de collection ?",
        "correct": "Contrat",
        "wrong": [
          "Logo"
        ]
      },
      "es": {
        "prompt": "¿Qué identificador on-chain es más difícil de copiar que un nombre de colección?",
        "correct": "Contrato",
        "wrong": [
          "Logo"
        ]
      }
    }
  },
  {
    "id": "squig-easy-013",
    "tier": 1,
    "category": "Learning",
    "prompt": "What should happen before spending real money?",
    "correct": "Learn",
    "wrong": [
      "FOMO"
    ],
    "correctRoast": "Correct. Learn survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Beginners should understand wallets, fees, verification, and risk before buying.",
    "i18n": {
      "en": {
        "prompt": "What should happen before spending real money?",
        "correct": "Learn",
        "wrong": [
          "FOMO"
        ]
      },
      "fr": {
        "prompt": "Que faut-il faire avant de dépenser de l'argent réel ?",
        "correct": "Apprendre",
        "wrong": [
          "FOMO"
        ]
      },
      "es": {
        "prompt": "¿Qué debería pasar antes de gastar dinero real?",
        "correct": "Aprender",
        "wrong": [
          "FOMO"
        ]
      }
    }
  },
  {
    "id": "squig-easy-014",
    "tier": 1,
    "category": "Transfers",
    "prompt": "What must match before sending funds away from an exchange?",
    "correct": "Network",
    "wrong": [
      "Color"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The destination network must match what the wallet and app support.",
    "i18n": {
      "en": {
        "prompt": "What must match before sending funds away from an exchange?",
        "correct": "Network",
        "wrong": [
          "Color"
        ]
      },
      "fr": {
        "prompt": "Que doit correspondre avant d'envoyer des fonds depuis un exchange ?",
        "correct": "Réseau",
        "wrong": [
          "Couleur"
        ]
      },
      "es": {
        "prompt": "¿Qué debe coincidir antes de enviar fondos desde un exchange?",
        "correct": "Red",
        "wrong": [
          "Color"
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
      "Discord"
    ],
    "correctRoast": "Correct. Explorer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A block explorer lets anyone inspect public blockchain data.",
    "i18n": {
      "en": {
        "prompt": "Where can public transaction status be inspected?",
        "correct": "Explorer",
        "wrong": [
          "Discord"
        ]
      },
      "fr": {
        "prompt": "Où peut-on inspecter le statut public d'une transaction ?",
        "correct": "Explorer",
        "wrong": [
          "Discord"
        ]
      },
      "es": {
        "prompt": "¿Dónde se puede inspeccionar el estado público de una transacción?",
        "correct": "Explorer",
        "wrong": [
          "Discord"
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
      "Password"
    ],
    "correctRoast": "Correct. Signature survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Some signatures prove wallet control, but users still need to read what they sign.",
    "i18n": {
      "en": {
        "prompt": "What may prove wallet control without sending tokens?",
        "correct": "Signature",
        "wrong": [
          "Password"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut prouver le contrôle d'un wallet sans envoyer de tokens ?",
        "correct": "Signature",
        "wrong": [
          "Passe"
        ]
      },
      "es": {
        "prompt": "¿Qué puede probar control del wallet sin enviar tokens?",
        "correct": "Firma",
        "wrong": [
          "Clave"
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
      "Mascot"
    ],
    "correctRoast": "Correct. Prompt survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wallet prompts describe the action or permission being requested.",
    "i18n": {
      "en": {
        "prompt": "What should be read before confirming a wallet action?",
        "correct": "Prompt",
        "wrong": [
          "Mascot"
        ]
      },
      "fr": {
        "prompt": "Que faut-il lire avant de confirmer une action wallet ?",
        "correct": "Popup",
        "wrong": [
          "Mascotte"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe leer antes de confirmar una acción del wallet?",
        "correct": "Popup",
        "wrong": [
          "Mascota"
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
      "PDF"
    ],
    "correctRoast": "Correct. ENS survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Name services can resolve readable names to wallet addresses, but the result should be checked.",
    "i18n": {
      "en": {
        "prompt": "What can map a readable name to a wallet destination?",
        "correct": "ENS",
        "wrong": [
          "PDF"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut lier un nom lisible à une destination wallet ?",
        "correct": "ENS",
        "wrong": [
          "PDF"
        ]
      },
      "es": {
        "prompt": "¿Qué puede vincular un nombre legible con un destino wallet?",
        "correct": "ENS",
        "wrong": [
          "PDF"
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
      "Screenshot"
    ],
    "correctRoast": "Correct. Token survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "On-chain token ownership is the ownership record; screenshots are not proof.",
    "i18n": {
      "en": {
        "prompt": "What proves a wallet owns a specific collectible?",
        "correct": "Token",
        "wrong": [
          "Screenshot"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui prouve qu'un wallet possède un collectible précis ?",
        "correct": "Token",
        "wrong": [
          "Capture"
        ]
      },
      "es": {
        "prompt": "¿Qué prueba que un wallet posee un coleccionable específico?",
        "correct": "Token",
        "wrong": [
          "Captura"
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
      "Panic"
    ],
    "correctRoast": "Correct. Caution survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A careful pace beats rushed clicks, hype, and scam pressure.",
    "i18n": {
      "en": {
        "prompt": "What protects beginners from hype and ugly mistakes?",
        "correct": "Caution",
        "wrong": [
          "Panic"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui protège les débutants du hype et des erreurs laides ?",
        "correct": "Prudence",
        "wrong": [
          "Panique"
        ]
      },
      "es": {
        "prompt": "¿Qué protege a principiantes del hype y errores feos?",
        "correct": "Cautela",
        "wrong": [
          "Pánico"
        ]
      }
    }
  },
  {
    "id": "squig-certified-001",
    "tier": 2,
    "category": "Exchange Security",
    "prompt": "What should protect an exchange login?",
    "correct": "2FA",
    "wrong": [
      "Theme",
      "Avatar"
    ],
    "correctRoast": "Correct. 2FA survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Two-factor authentication helps protect exchange accounts from password-only failure.",
    "i18n": {
      "en": {
        "prompt": "What should protect an exchange login?",
        "correct": "2FA",
        "wrong": [
          "Theme",
          "Avatar"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui doit protéger une connexion exchange ?",
        "correct": "2FA",
        "wrong": [
          "Thème",
          "Avatar"
        ]
      },
      "es": {
        "prompt": "¿Qué debe proteger un inicio de sesión en exchange?",
        "correct": "2FA",
        "wrong": [
          "Tema",
          "Avatar"
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
      "Lore",
      "Rarity"
    ],
    "correctRoast": "Correct. KYC survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Many centralized exchanges require identity checks before deposits, trades, or withdrawals.",
    "i18n": {
      "en": {
        "prompt": "What identity check may a regulated exchange require?",
        "correct": "KYC",
        "wrong": [
          "Lore",
          "Rarity"
        ]
      },
      "fr": {
        "prompt": "Quel contrôle d'identité un exchange régulé peut-il demander ?",
        "correct": "KYC",
        "wrong": [
          "Lore",
          "Rareté"
        ]
      },
      "es": {
        "prompt": "¿Qué verificación de identidad puede pedir un exchange regulado?",
        "correct": "KYC",
        "wrong": [
          "Lore",
          "Rareza"
        ]
      }
    }
  },
  {
    "id": "squig-certified-003",
    "tier": 2,
    "category": "Deposits",
    "prompt": "What should be checked before depositing regular money?",
    "correct": "Fees",
    "wrong": [
      "Stickers",
      "Mascot"
    ],
    "correctRoast": "Correct. Fees survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Deposit methods, fees, limits, and holds can affect the final amount and timing.",
    "i18n": {
      "en": {
        "prompt": "What should be checked before depositing regular money?",
        "correct": "Fees",
        "wrong": [
          "Stickers",
          "Mascot"
        ]
      },
      "fr": {
        "prompt": "Que faut-il vérifier avant de déposer de l'argent classique ?",
        "correct": "Frais",
        "wrong": [
          "Stickers",
          "Mascotte"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe revisar antes de depositar dinero normal?",
        "correct": "Tarifas",
        "wrong": [
          "Stickers",
          "Mascota"
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
      "BTC",
      "DOGE"
    ],
    "correctRoast": "Correct. ETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Ethereum NFT purchases usually require ETH for the price and gas.",
    "i18n": {
      "en": {
        "prompt": "Which balance is normally needed for Ethereum collectible shopping?",
        "correct": "ETH",
        "wrong": [
          "BTC",
          "DOGE"
        ]
      },
      "fr": {
        "prompt": "Quel solde faut-il généralement pour acheter des collectibles Ethereum ?",
        "correct": "ETH",
        "wrong": [
          "BTC",
          "DOGE"
        ]
      },
      "es": {
        "prompt": "¿Qué saldo suele hacer falta para comprar coleccionables Ethereum?",
        "correct": "ETH",
        "wrong": [
          "BTC",
          "DOGE"
        ]
      }
    }
  },
  {
    "id": "squig-certified-005",
    "tier": 2,
    "category": "Withdrawals",
    "prompt": "What should be confirmed before withdrawing from an exchange?",
    "correct": "Address",
    "wrong": [
      "Banner",
      "Emoji"
    ],
    "correctRoast": "Correct. Address survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Crypto transfers are hard to reverse, so the destination must be checked carefully.",
    "i18n": {
      "en": {
        "prompt": "What should be confirmed before withdrawing from an exchange?",
        "correct": "Address",
        "wrong": [
          "Banner",
          "Emoji"
        ]
      },
      "fr": {
        "prompt": "Que faut-il confirmer avant un retrait depuis un exchange ?",
        "correct": "Adresse",
        "wrong": [
          "Bannière",
          "Emoji"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe confirmar antes de retirar desde un exchange?",
        "correct": "Dirección",
        "wrong": [
          "Banner",
          "Emoji"
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
      "Logo",
      "Ranking"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wrong-network transfers can make funds hard or impossible to access.",
    "i18n": {
      "en": {
        "prompt": "Which withdrawal choice must match the destination wallet and app?",
        "correct": "Network",
        "wrong": [
          "Logo",
          "Ranking"
        ]
      },
      "fr": {
        "prompt": "Quel choix de retrait doit correspondre au wallet et à l'app destination ?",
        "correct": "Réseau",
        "wrong": [
          "Logo",
          "Classement"
        ]
      },
      "es": {
        "prompt": "¿Qué opción de retiro debe coincidir con el wallet y la app destino?",
        "correct": "Red",
        "wrong": [
          "Logo",
          "Ranking"
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
      "Prayer",
      "Speed"
    ],
    "correctRoast": "Correct. Test survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A small test transfer can confirm the address and network before moving more value.",
    "i18n": {
      "en": {
        "prompt": "What reduces risk before sending a large amount?",
        "correct": "Test",
        "wrong": [
          "Prayer",
          "Speed"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui réduit le risque avant d'envoyer un gros montant ?",
        "correct": "Test",
        "wrong": [
          "Prière",
          "Vitesse"
        ]
      },
      "es": {
        "prompt": "¿Qué reduce el riesgo antes de enviar una cantidad grande?",
        "correct": "Prueba",
        "wrong": [
          "Rezo",
          "Velocidad"
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
      "Selfie",
      "Screenshot"
    ],
    "correctRoast": "Correct. Backup survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Secure offline backups help prevent permanent wallet loss.",
    "i18n": {
      "en": {
        "prompt": "What should be stored offline during wallet setup?",
        "correct": "Backup",
        "wrong": [
          "Selfie",
          "Screenshot"
        ]
      },
      "fr": {
        "prompt": "Que faut-il garder offline pendant la configuration du wallet ?",
        "correct": "Sauvegarde",
        "wrong": [
          "Selfie",
          "Capture"
        ]
      },
      "es": {
        "prompt": "¿Qué debe guardarse offline al configurar el wallet?",
        "correct": "Respaldo",
        "wrong": [
          "Selfie",
          "Captura"
        ]
      }
    }
  },
  {
    "id": "squig-certified-009",
    "tier": 2,
    "category": "Secret Storage",
    "prompt": "What should never be saved in cloud screenshots?",
    "correct": "Seed",
    "wrong": [
      "Address",
      "Avatar"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Cloud screenshots can leak recovery secrets to attackers.",
    "i18n": {
      "en": {
        "prompt": "What should never be saved in cloud screenshots?",
        "correct": "Seed",
        "wrong": [
          "Address",
          "Avatar"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui ne doit jamais être sauvegardé en captures cloud ?",
        "correct": "Seed",
        "wrong": [
          "Adresse",
          "Avatar"
        ]
      },
      "es": {
        "prompt": "¿Qué nunca debe guardarse en capturas de la nube?",
        "correct": "Semilla",
        "wrong": [
          "Dirección",
          "Avatar"
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
      "Freedom",
      "Rarity"
    ],
    "correctRoast": "Correct. Custody survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Custodial platforms hold keys and credit users internally.",
    "i18n": {
      "en": {
        "prompt": "What describes assets held by a company account?",
        "correct": "Custody",
        "wrong": [
          "Freedom",
          "Rarity"
        ]
      },
      "fr": {
        "prompt": "Quel mot décrit des actifs gardés par un compte d'entreprise ?",
        "correct": "Custodie",
        "wrong": [
          "Liberté",
          "Rareté"
        ]
      },
      "es": {
        "prompt": "¿Qué describe activos guardados por una cuenta de empresa?",
        "correct": "Custodia",
        "wrong": [
          "Libertad",
          "Rareza"
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
      "Exchange",
      "Browser"
    ],
    "correctRoast": "Correct. Wallet survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A self-custody wallet gives control and responsibility to the holder.",
    "i18n": {
      "en": {
        "prompt": "What gives direct control after withdrawing from a platform?",
        "correct": "Wallet",
        "wrong": [
          "Exchange",
          "Browser"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui donne un contrôle direct après retrait d'une plateforme ?",
        "correct": "Wallet",
        "wrong": [
          "Exchange",
          "Navigateur"
        ]
      },
      "es": {
        "prompt": "¿Qué da control directo tras retirar desde una plataforma?",
        "correct": "Wallet",
        "wrong": [
          "Exchange",
          "Navegador"
        ]
      }
    }
  },
  {
    "id": "squig-certified-012",
    "tier": 2,
    "category": "Prices",
    "prompt": "What should be compared before buying crypto?",
    "correct": "Price",
    "wrong": [
      "Mood",
      "Confetti"
    ],
    "correctRoast": "Correct. Price survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Displayed quotes can vary by fee, spread, and payment method.",
    "i18n": {
      "en": {
        "prompt": "What should be compared before buying crypto?",
        "correct": "Price",
        "wrong": [
          "Mood",
          "Confetti"
        ]
      },
      "fr": {
        "prompt": "Que faut-il comparer avant d'acheter de la crypto ?",
        "correct": "Prix",
        "wrong": [
          "Humeur",
          "Confetti"
        ]
      },
      "es": {
        "prompt": "¿Qué conviene comparar antes de comprar cripto?",
        "correct": "Precio",
        "wrong": [
          "Humor",
          "Confeti"
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
      "Trait",
      "Crown"
    ],
    "correctRoast": "Correct. Spread survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A spread is the difference between quoted buy and sell prices.",
    "i18n": {
      "en": {
        "prompt": "What hidden trading cost can reduce the received amount?",
        "correct": "Spread",
        "wrong": [
          "Trait",
          "Crown"
        ]
      },
      "fr": {
        "prompt": "Quel coût de trading caché peut réduire le montant reçu ?",
        "correct": "Spread",
        "wrong": [
          "Trait",
          "Couronne"
        ]
      },
      "es": {
        "prompt": "¿Qué coste oculto de trading puede reducir lo recibido?",
        "correct": "Spread",
        "wrong": [
          "Rasgo",
          "Corona"
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
      "Sticker",
      "Hat"
    ],
    "correctRoast": "Correct. Address survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Readable names are convenient, but the resolved destination should still be confirmed.",
    "i18n": {
      "en": {
        "prompt": "What must be verified when using a readable wallet name?",
        "correct": "Address",
        "wrong": [
          "Sticker",
          "Hat"
        ]
      },
      "fr": {
        "prompt": "Que faut-il vérifier avec un nom wallet lisible ?",
        "correct": "Adresse",
        "wrong": [
          "Sticker",
          "Chapeau"
        ]
      },
      "es": {
        "prompt": "¿Qué debe verificarse al usar un nombre legible de wallet?",
        "correct": "Dirección",
        "wrong": [
          "Sticker",
          "Sombrero"
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
      "Paid",
      "Minted"
    ],
    "correctRoast": "Correct. Pending survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Pending transactions may still be waiting for confirmation.",
    "i18n": {
      "en": {
        "prompt": "What status means a transfer is not final yet?",
        "correct": "Pending",
        "wrong": [
          "Paid",
          "Minted"
        ]
      },
      "fr": {
        "prompt": "Quel statut indique qu'un transfert n'est pas encore final ?",
        "correct": "Pending",
        "wrong": [
          "Payé",
          "Minté"
        ]
      },
      "es": {
        "prompt": "¿Qué estado indica que una transferencia aún no es final?",
        "correct": "Pendiente",
        "wrong": [
          "Pagado",
          "Minteado"
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
      "Verifying",
      "Waiting"
    ],
    "correctRoast": "Correct. Sharing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Legitimate support should not need a seed phrase or private key.",
    "i18n": {
      "en": {
        "prompt": "What should be avoided when support asks for secrets?",
        "correct": "Sharing",
        "wrong": [
          "Verifying",
          "Waiting"
        ]
      },
      "fr": {
        "prompt": "Que faut-il éviter si le support demande des secrets ?",
        "correct": "Partager",
        "wrong": [
          "Vérifier",
          "Attendre"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe evitar si soporte pide secretos?",
        "correct": "Compartir",
        "wrong": [
          "Verificar",
          "Esperar"
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
      "Rumors",
      "Popups"
    ],
    "correctRoast": "Correct. Bookmarks survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Bookmarks reduce the risk of phishing links from ads, DMs, and search results.",
    "i18n": {
      "en": {
        "prompt": "What should official project links become?",
        "correct": "Bookmarks",
        "wrong": [
          "Rumors",
          "Popups"
        ]
      },
      "fr": {
        "prompt": "Que devraient devenir les liens officiels du projet ?",
        "correct": "Favoris",
        "wrong": [
          "Rumeurs",
          "Popups"
        ]
      },
      "es": {
        "prompt": "¿En qué deberían convertirse los enlaces oficiales del proyecto?",
        "correct": "Marcadores",
        "wrong": [
          "Rumores",
          "Popups"
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
      "Help",
      "Grammar"
    ],
    "correctRoast": "Correct. Urgency survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Scammers often use urgency to push unsafe clicks and signatures.",
    "i18n": {
      "en": {
        "prompt": "What signal in messages should make a beginner slow down?",
        "correct": "Urgency",
        "wrong": [
          "Help",
          "Grammar"
        ]
      },
      "fr": {
        "prompt": "Quel signal dans les messages doit faire ralentir un débutant ?",
        "correct": "Urgence",
        "wrong": [
          "Aide",
          "Grammaire"
        ]
      },
      "es": {
        "prompt": "¿Qué señal en mensajes debería hacer frenar a un principiante?",
        "correct": "Urgencia",
        "wrong": [
          "Ayuda",
          "Gramática"
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
      "Rent",
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
          "Rent",
          "Loan"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui doit limiter les premiers achats d'un débutant ?",
        "correct": "Budget",
        "wrong": [
          "Loyer",
          "Prêt"
        ]
      },
      "es": {
        "prompt": "¿Qué debería limitar las primeras compras de un principiante?",
        "correct": "Presupuesto",
        "wrong": [
          "Renta",
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
      "Flexing",
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
          "Flexing",
          "Bidding"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui vient avant d'acheter des collectibles ?",
        "correct": "Sécurité",
        "wrong": [
          "Flex",
          "Offre"
        ]
      },
      "es": {
        "prompt": "¿Qué viene antes de comprar coleccionables?",
        "correct": "Seguridad",
        "wrong": [
          "Flex",
          "Oferta"
        ]
      }
    }
  },
  {
    "id": "squig-deep-001",
    "tier": 3,
    "category": "Marketplaces",
    "prompt": "Which platform do many buyers use to browse Ethereum collectible listings?",
    "correct": "OpenSea",
    "wrong": [
      "Etherscan",
      "Uniswap"
    ],
    "correctRoast": "Correct. OpenSea survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "OpenSea is a common marketplace for browsing and buying Ethereum NFTs.",
    "i18n": {
      "en": {
        "prompt": "Which platform do many buyers use to browse Ethereum collectible listings?",
        "correct": "OpenSea",
        "wrong": [
          "Etherscan",
          "Uniswap"
        ]
      },
      "fr": {
        "prompt": "Quelle plateforme beaucoup d'acheteurs utilisent-ils pour voir des listings Ethereum ?",
        "correct": "OpenSea",
        "wrong": [
          "Etherscan",
          "Uniswap"
        ]
      },
      "es": {
        "prompt": "¿Qué plataforma usan muchos compradores para ver listings de Ethereum?",
        "correct": "OpenSea",
        "wrong": [
          "Etherscan",
          "Uniswap"
        ]
      }
    }
  },
  {
    "id": "squig-deep-002",
    "tier": 3,
    "category": "Collection Search",
    "prompt": "What should be found through official project links?",
    "correct": "Collection",
    "wrong": [
      "Influencer",
      "Advertisement"
    ],
    "correctRoast": "Correct. Collection survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Official links help buyers find the real collection instead of a copycat.",
    "i18n": {
      "en": {
        "prompt": "What should be found through official project links?",
        "correct": "Collection",
        "wrong": [
          "Influencer",
          "Advertisement"
        ]
      },
      "fr": {
        "prompt": "Que faut-il trouver via les liens officiels du projet ?",
        "correct": "Collection",
        "wrong": [
          "Influenceur",
          "Publicité"
        ]
      },
      "es": {
        "prompt": "¿Qué debe encontrarse mediante enlaces oficiales del proyecto?",
        "correct": "Colección",
        "wrong": [
          "Influencer",
          "Anuncio"
        ]
      }
    }
  },
  {
    "id": "squig-deep-003",
    "tier": 3,
    "category": "Contracts",
    "prompt": "What identifies the real set on-chain?",
    "correct": "Contract",
    "wrong": [
      "Banner",
      "Volume"
    ],
    "correctRoast": "Correct. Contract survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The official contract is the core identifier for a real NFT collection.",
    "i18n": {
      "en": {
        "prompt": "What identifies the real set on-chain?",
        "correct": "Contract",
        "wrong": [
          "Banner",
          "Volume"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui identifie le vrai set on-chain ?",
        "correct": "Contrat",
        "wrong": [
          "Bannière",
          "Volume"
        ]
      },
      "es": {
        "prompt": "¿Qué identifica el conjunto real on-chain?",
        "correct": "Contrato",
        "wrong": [
          "Banner",
          "Volumen"
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
      "Price",
      "Rank"
    ],
    "correctRoast": "Correct. Token survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A token ID identifies a specific NFT within its contract.",
    "i18n": {
      "en": {
        "prompt": "What number identifies one item inside a collection contract?",
        "correct": "Token",
        "wrong": [
          "Price",
          "Rank"
        ]
      },
      "fr": {
        "prompt": "Quel numéro identifie un item dans un contrat de collection ?",
        "correct": "Token",
        "wrong": [
          "Prix",
          "Rang"
        ]
      },
      "es": {
        "prompt": "¿Qué número identifica un ítem dentro de un contrato de colección?",
        "correct": "Token",
        "wrong": [
          "Precio",
          "Rango"
        ]
      }
    }
  },
  {
    "id": "squig-deep-005",
    "tier": 3,
    "category": "Metadata",
    "prompt": "What describes the media and attributes of a collectible?",
    "correct": "Metadata",
    "wrong": [
      "Gas",
      "Seed"
    ],
    "correctRoast": "Correct. Metadata survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Metadata points to information such as image, name, description, and traits.",
    "i18n": {
      "en": {
        "prompt": "What describes the media and attributes of a collectible?",
        "correct": "Metadata",
        "wrong": [
          "Gas",
          "Seed"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui décrit le média et les attributs d'un collectible ?",
        "correct": "Métadonnées",
        "wrong": [
          "Gas",
          "Seed"
        ]
      },
      "es": {
        "prompt": "¿Qué describe el medio y los atributos de un coleccionable?",
        "correct": "Metadatos",
        "wrong": [
          "Gas",
          "Semilla"
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
      "Fees",
      "Password"
    ],
    "correctRoast": "Correct. Traits survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Traits can affect rarity and preference, but they do not guarantee value.",
    "i18n": {
      "en": {
        "prompt": "What visual properties can affect collector preference?",
        "correct": "Traits",
        "wrong": [
          "Fees",
          "Password"
        ]
      },
      "fr": {
        "prompt": "Quelles propriétés visuelles peuvent influencer les préférences des collectionneurs ?",
        "correct": "Traits",
        "wrong": [
          "Frais",
          "Passe"
        ]
      },
      "es": {
        "prompt": "¿Qué propiedades visuales pueden influir en preferencias de coleccionistas?",
        "correct": "Rasgos",
        "wrong": [
          "Tarifas",
          "Clave"
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
      "Ceiling",
      "Profit"
    ],
    "correctRoast": "Correct. Floor survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Floor price is a current listing snapshot, not a guaranteed sale price.",
    "i18n": {
      "en": {
        "prompt": "What means the lowest current listed price?",
        "correct": "Floor",
        "wrong": [
          "Ceiling",
          "Profit"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui signifie le prix listé le plus bas actuellement ?",
        "correct": "Floor",
        "wrong": [
          "Plafond",
          "Profit"
        ]
      },
      "es": {
        "prompt": "¿Qué significa el precio listado más bajo actual?",
        "correct": "Floor",
        "wrong": [
          "Techo",
          "Ganancia"
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
      "Airdrop",
      "Approval"
    ],
    "correctRoast": "Correct. Listing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A listing is a sale order that can remain active until filled or canceled.",
    "i18n": {
      "en": {
        "prompt": "What means an owner has offered an item for sale?",
        "correct": "Listing",
        "wrong": [
          "Airdrop",
          "Approval"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui signifie qu'un propriétaire propose un item à la vente ?",
        "correct": "Listing",
        "wrong": [
          "Airdrop",
          "Approbation"
        ]
      },
      "es": {
        "prompt": "¿Qué significa que un dueño ofrece un ítem en venta?",
        "correct": "Listing",
        "wrong": [
          "Airdrop",
          "Aprobación"
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
      "Fee",
      "Trait"
    ],
    "correctRoast": "Correct. Offer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "An offer is a bid that the owner can accept or ignore.",
    "i18n": {
      "en": {
        "prompt": "What is a buyer's bid on an item called?",
        "correct": "Offer",
        "wrong": [
          "Fee",
          "Trait"
        ]
      },
      "fr": {
        "prompt": "Comment appelle-t-on l'enchère d'un acheteur sur un item ?",
        "correct": "Offre",
        "wrong": [
          "Frais",
          "Trait"
        ]
      },
      "es": {
        "prompt": "¿Cómo se llama la puja de un comprador por un ítem?",
        "correct": "Oferta",
        "wrong": [
          "Tarifa",
          "Rasgo"
        ]
      }
    }
  },
  {
    "id": "squig-deep-010",
    "tier": 3,
    "category": "Checkout",
    "prompt": "What must be inspected before using a buy button?",
    "correct": "Price",
    "wrong": [
      "Confetti",
      "Banner"
    ],
    "correctRoast": "Correct. Price survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The price, fees, token, network, and action should match the buyer's intention.",
    "i18n": {
      "en": {
        "prompt": "What must be inspected before using a buy button?",
        "correct": "Price",
        "wrong": [
          "Confetti",
          "Banner"
        ]
      },
      "fr": {
        "prompt": "Que faut-il inspecter avant d'utiliser le bouton d'achat ?",
        "correct": "Prix",
        "wrong": [
          "Confetti",
          "Bannière"
        ]
      },
      "es": {
        "prompt": "¿Qué debe inspeccionarse antes de usar el botón de compra?",
        "correct": "Precio",
        "wrong": [
          "Confeti",
          "Banner"
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
      "Fiat",
      "JPEG"
    ],
    "correctRoast": "Correct. WETH survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Some marketplaces use WETH for offers because contracts can handle it as a token.",
    "i18n": {
      "en": {
        "prompt": "Which wrapped asset may be needed for bids?",
        "correct": "WETH",
        "wrong": [
          "Fiat",
          "JPEG"
        ]
      },
      "fr": {
        "prompt": "Quel actif emballé peut être nécessaire pour les offres ?",
        "correct": "WETH",
        "wrong": [
          "Fiat",
          "JPEG"
        ]
      },
      "es": {
        "prompt": "¿Qué activo envuelto puede hacer falta para ofertas?",
        "correct": "WETH",
        "wrong": [
          "Fiat",
          "JPEG"
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
      "Rarity",
      "Seed"
    ],
    "correctRoast": "Correct. Gas survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Network congestion can make transaction fees more expensive.",
    "i18n": {
      "en": {
        "prompt": "What can rise when network traffic gets heavy?",
        "correct": "Gas",
        "wrong": [
          "Rarity",
          "Seed"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut augmenter quand le trafic réseau est fort ?",
        "correct": "Gas",
        "wrong": [
          "Rareté",
          "Seed"
        ]
      },
      "es": {
        "prompt": "¿Qué puede subir cuando el tráfico de red es alto?",
        "correct": "Gas",
        "wrong": [
          "Rareza",
          "Semilla"
        ]
      }
    }
  },
  {
    "id": "squig-deep-013",
    "tier": 3,
    "category": "Copies",
    "prompt": "What is a likely sign of a copied collection?",
    "correct": "Impersonation",
    "wrong": [
      "Metadata",
      "Royalty"
    ],
    "correctRoast": "Correct. Impersonation survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Impersonation copies names, images, and pages to trick buyers.",
    "i18n": {
      "en": {
        "prompt": "What is a likely sign of a copied collection?",
        "correct": "Impersonation",
        "wrong": [
          "Metadata",
          "Royalty"
        ]
      },
      "fr": {
        "prompt": "Quel est un signe probable d'une collection copiée ?",
        "correct": "Usurpation",
        "wrong": [
          "Métadonnées",
          "Royalty"
        ]
      },
      "es": {
        "prompt": "¿Cuál es una señal probable de una colección copiada?",
        "correct": "Suplantación",
        "wrong": [
          "Metadatos",
          "Regalía"
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
      "Gratitude",
      "FOMO"
    ],
    "correctRoast": "Correct. Suspicion survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Unexpected NFTs can be spam or phishing bait.",
    "i18n": {
      "en": {
        "prompt": "What should unknown wallet gifts trigger?",
        "correct": "Suspicion",
        "wrong": [
          "Gratitude",
          "FOMO"
        ]
      },
      "fr": {
        "prompt": "Que doivent déclencher des cadeaux inconnus dans un wallet ?",
        "correct": "Suspicion",
        "wrong": [
          "Gratitude",
          "FOMO"
        ]
      },
      "es": {
        "prompt": "¿Qué deberían provocar regalos desconocidos en un wallet?",
        "correct": "Sospecha",
        "wrong": [
          "Gratitud",
          "FOMO"
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
      "Tribute",
      "Screenshot"
    ],
    "correctRoast": "Correct. Approval survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Approvals allow contracts to transfer assets under specific conditions.",
    "i18n": {
      "en": {
        "prompt": "What permission lets a marketplace move an item during sale?",
        "correct": "Approval",
        "wrong": [
          "Tribute",
          "Screenshot"
        ]
      },
      "fr": {
        "prompt": "Quelle permission permet à une marketplace de déplacer un item pendant une vente ?",
        "correct": "Approbation",
        "wrong": [
          "Tribut",
          "Capture"
        ]
      },
      "es": {
        "prompt": "¿Qué permiso deja que una marketplace mueva un ítem durante la venta?",
        "correct": "Aprobación",
        "wrong": [
          "Tributo",
          "Captura"
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
      "Refresh",
      "Rename"
    ],
    "correctRoast": "Correct. Revoke survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Revoking old approvals reduces permission exposure.",
    "i18n": {
      "en": {
        "prompt": "What removes an old marketplace permission?",
        "correct": "Revoke",
        "wrong": [
          "Refresh",
          "Rename"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui retire une ancienne permission de marketplace ?",
        "correct": "Révoquer",
        "wrong": [
          "Rafraîchir",
          "Renommer"
        ]
      },
      "es": {
        "prompt": "¿Qué quita un permiso viejo de marketplace?",
        "correct": "Revocar",
        "wrong": [
          "Refrescar",
          "Renombrar"
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
      "Trailer",
      "Chat"
    ],
    "correctRoast": "Correct. Explorer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Block explorers show public ownership and transaction data.",
    "i18n": {
      "en": {
        "prompt": "What shows independent ownership data?",
        "correct": "Explorer",
        "wrong": [
          "Trailer",
          "Chat"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui montre des données de propriété indépendantes ?",
        "correct": "Explorer",
        "wrong": [
          "Bande",
          "Chat"
        ]
      },
      "es": {
        "prompt": "¿Qué muestra datos independientes de propiedad?",
        "correct": "Explorer",
        "wrong": [
          "Tráiler",
          "Chat"
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
      "Patience",
      "Status"
    ],
    "correctRoast": "Correct. Duplicates survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Duplicate panic clicks can create extra transactions or confusion.",
    "i18n": {
      "en": {
        "prompt": "What should be avoided while a purchase is pending?",
        "correct": "Duplicates",
        "wrong": [
          "Patience",
          "Status"
        ]
      },
      "fr": {
        "prompt": "Que faut-il éviter pendant qu'un achat est pending ?",
        "correct": "Doublons",
        "wrong": [
          "Patience",
          "Statut"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe evitar mientras una compra está pendiente?",
        "correct": "Duplicados",
        "wrong": [
          "Paciencia",
          "Estado"
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
      "Theft",
      "Burning"
    ],
    "correctRoast": "Correct. Indexing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wallets and marketplaces may need time to index metadata.",
    "i18n": {
      "en": {
        "prompt": "What can delay an image after purchase?",
        "correct": "Indexing",
        "wrong": [
          "Theft",
          "Burning"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut retarder une image après achat ?",
        "correct": "Indexation",
        "wrong": [
          "Vol",
          "Brûlage"
        ]
      },
      "es": {
        "prompt": "¿Qué puede retrasar una imagen después de comprar?",
        "correct": "Indexación",
        "wrong": [
          "Robo",
          "Quema"
        ]
      }
    }
  },
  {
    "id": "squig-deep-020",
    "tier": 3,
    "category": "Confirmation",
    "prompt": "What should the final wallet action match?",
    "correct": "Intent",
    "wrong": [
      "Hype",
      "Color"
    ],
    "correctRoast": "Correct. Intent survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The wallet prompt should match what the buyer intends to do.",
    "i18n": {
      "en": {
        "prompt": "What should the final wallet action match?",
        "correct": "Intent",
        "wrong": [
          "Hype",
          "Color"
        ]
      },
      "fr": {
        "prompt": "À quoi l'action finale du wallet doit-elle correspondre ?",
        "correct": "Intention",
        "wrong": [
          "Hype",
          "Couleur"
        ]
      },
      "es": {
        "prompt": "¿Con qué debe coincidir la acción final del wallet?",
        "correct": "Intención",
        "wrong": [
          "Hype",
          "Color"
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
      "Indexing",
      "Bridging",
      "Minting"
    ],
    "correctRoast": "Correct. Phishing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Phishing pages imitate real sites to steal signatures, approvals, or secrets.",
    "i18n": {
      "en": {
        "prompt": "What attack copies real project pages?",
        "correct": "Phishing",
        "wrong": [
          "Indexing",
          "Bridging",
          "Minting"
        ]
      },
      "fr": {
        "prompt": "Quelle attaque copie les vraies pages d'un projet ?",
        "correct": "Phishing",
        "wrong": [
          "Indexation",
          "Bridge",
          "Mint"
        ]
      },
      "es": {
        "prompt": "¿Qué ataque copia páginas reales de un proyecto?",
        "correct": "Phishing",
        "wrong": [
          "Indexación",
          "Bridge",
          "Mint"
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
      "Bright",
      "Public",
      "Cached"
    ],
    "correctRoast": "Correct. Blind survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Blind signing can hide dangerous actions behind unreadable data.",
    "i18n": {
      "en": {
        "prompt": "Which signing risk means approving data you cannot understand?",
        "correct": "Blind",
        "wrong": [
          "Bright",
          "Public",
          "Cached"
        ]
      },
      "fr": {
        "prompt": "Quel risque de signature signifie approuver des données incomprises ?",
        "correct": "Aveugle",
        "wrong": [
          "Brillant",
          "Public",
          "Cache"
        ]
      },
      "es": {
        "prompt": "¿Qué riesgo de firma significa aprobar datos que no entiendes?",
        "correct": "Ciega",
        "wrong": [
          "Brillante",
          "Pública",
          "Caché"
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
      "Exchange",
      "Browser",
      "Marketplace"
    ],
    "correctRoast": "Correct. Hardware survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Hardware wallets isolate keys and require physical confirmation.",
    "i18n": {
      "en": {
        "prompt": "What device type keeps private keys offline?",
        "correct": "Hardware",
        "wrong": [
          "Exchange",
          "Browser",
          "Marketplace"
        ]
      },
      "fr": {
        "prompt": "Quel type d'appareil garde les clés privées offline ?",
        "correct": "Matériel",
        "wrong": [
          "Exchange",
          "Navigateur",
          "Marketplace"
        ]
      },
      "es": {
        "prompt": "¿Qué tipo de dispositivo mantiene llaves privadas offline?",
        "correct": "Hardware",
        "wrong": [
          "Exchange",
          "Navegador",
          "Marketplace"
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
      "Vault",
      "Mainnet",
      "Exchange"
    ],
    "correctRoast": "Correct. Burner survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Burner wallets limit exposure when trying unfamiliar apps.",
    "i18n": {
      "en": {
        "prompt": "What kind of wallet tests risky sites with little value?",
        "correct": "Burner",
        "wrong": [
          "Vault",
          "Mainnet",
          "Exchange"
        ]
      },
      "fr": {
        "prompt": "Quel genre de wallet teste les sites risqués avec peu de valeur ?",
        "correct": "Burner",
        "wrong": [
          "Coffre",
          "Mainnet",
          "Exchange"
        ]
      },
      "es": {
        "prompt": "¿Qué tipo de wallet prueba sitios riesgosos con poco valor?",
        "correct": "Burner",
        "wrong": [
          "Bóveda",
          "Mainnet",
          "Exchange"
        ]
      }
    }
  },
  {
    "id": "squig-internal-005",
    "tier": 4,
    "category": "Vaults",
    "prompt": "What kind of wallet stores valuables with minimal clicking?",
    "correct": "Vault",
    "wrong": [
      "Burner",
      "Browser",
      "Exchange"
    ],
    "correctRoast": "Correct. Vault survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Vault wallets should avoid routine risky interactions.",
    "i18n": {
      "en": {
        "prompt": "What kind of wallet stores valuables with minimal clicking?",
        "correct": "Vault",
        "wrong": [
          "Burner",
          "Browser",
          "Exchange"
        ]
      },
      "fr": {
        "prompt": "Quel genre de wallet garde les objets précieux avec peu de clics ?",
        "correct": "Coffre",
        "wrong": [
          "Burner",
          "Navigateur",
          "Exchange"
        ]
      },
      "es": {
        "prompt": "¿Qué tipo de wallet guarda objetos valiosos con pocos clics?",
        "correct": "Bóveda",
        "wrong": [
          "Burner",
          "Navegador",
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
      "Revoked",
      "Expired"
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
          "Revoked",
          "Expired"
        ]
      },
      "fr": {
        "prompt": "Quelle portée de permission est la plus dangereuse ?",
        "correct": "Illimité",
        "wrong": [
          "Limité",
          "Révoqué",
          "Expiré"
        ]
      },
      "es": {
        "prompt": "¿Qué alcance de permiso es más peligroso?",
        "correct": "Ilimitado",
        "wrong": [
          "Limitado",
          "Revocado",
          "Expirado"
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
      "Listed",
      "Minted",
      "Bridged"
    ],
    "correctRoast": "Correct. Revoked survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Old approvals can remain active until revoked.",
    "i18n": {
      "en": {
        "prompt": "What should happen to old unused permissions?",
        "correct": "Revoked",
        "wrong": [
          "Listed",
          "Minted",
          "Bridged"
        ]
      },
      "fr": {
        "prompt": "Que faut-il faire aux anciennes permissions inutilisées ?",
        "correct": "Révoqué",
        "wrong": [
          "Listé",
          "Minté",
          "Bridgé"
        ]
      },
      "es": {
        "prompt": "¿Qué debería pasar con permisos viejos sin uso?",
        "correct": "Revocado",
        "wrong": [
          "Listado",
          "Minteado",
          "Bridgeado"
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
      "Slippage",
      "Royalty",
      "Metadata"
    ],
    "correctRoast": "Correct. Poisoning survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Address poisoning tries to trick users into copying the wrong destination.",
    "i18n": {
      "en": {
        "prompt": "What scam uses tiny lookalike transfers?",
        "correct": "Poisoning",
        "wrong": [
          "Slippage",
          "Royalty",
          "Metadata"
        ]
      },
      "fr": {
        "prompt": "Quelle arnaque utilise de petits transferts ressemblants ?",
        "correct": "Poisoning",
        "wrong": [
          "Slippage",
          "Royalty",
          "Métadonnées"
        ]
      },
      "es": {
        "prompt": "¿Qué estafa usa transferencias pequeñas parecidas?",
        "correct": "Poisoning",
        "wrong": [
          "Slippage",
          "Regalía",
          "Metadatos"
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
      "IPFS",
      "WETH",
      "KYC"
    ],
    "correctRoast": "Correct. ENS survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "ENS names should resolve to the intended wallet before funds are sent.",
    "i18n": {
      "en": {
        "prompt": "What readable-name service must resolve correctly before sending?",
        "correct": "ENS",
        "wrong": [
          "IPFS",
          "WETH",
          "KYC"
        ]
      },
      "fr": {
        "prompt": "Quel service de nom lisible doit résoudre correctement avant envoi ?",
        "correct": "ENS",
        "wrong": [
          "IPFS",
          "WETH",
          "KYC"
        ]
      },
      "es": {
        "prompt": "¿Qué servicio de nombre legible debe resolver bien antes de enviar?",
        "correct": "ENS",
        "wrong": [
          "IPFS",
          "WETH",
          "KYC"
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
      "Rarity",
      "Royalty",
      "Floor"
    ],
    "correctRoast": "Correct. Slippage survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Slippage is common in swaps and can affect token trades.",
    "i18n": {
      "en": {
        "prompt": "What problem means final trade price differs from the quote?",
        "correct": "Slippage",
        "wrong": [
          "Rarity",
          "Royalty",
          "Floor"
        ]
      },
      "fr": {
        "prompt": "Quel problème signifie que le prix final diffère du devis ?",
        "correct": "Slippage",
        "wrong": [
          "Rareté",
          "Royalty",
          "Floor"
        ]
      },
      "es": {
        "prompt": "¿Qué problema significa que el precio final difiere de la cotización?",
        "correct": "Slippage",
        "wrong": [
          "Rareza",
          "Regalía",
          "Floor"
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
      "Metadata",
      "ENS",
      "Backup"
    ],
    "correctRoast": "Correct. Liquidity survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "NFT liquidity depends on buyers, demand, price, and individual item appeal.",
    "i18n": {
      "en": {
        "prompt": "What makes collectibles harder to sell quickly?",
        "correct": "Liquidity",
        "wrong": [
          "Metadata",
          "ENS",
          "Backup"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui rend les collectibles plus difficiles à vendre vite ?",
        "correct": "Liquidité",
        "wrong": [
          "Métadonnées",
          "ENS",
          "Sauvegarde"
        ]
      },
      "es": {
        "prompt": "¿Qué hace que coleccionables sean más difíciles de vender rápido?",
        "correct": "Liquidez",
        "wrong": [
          "Metadatos",
          "ENS",
          "Respaldo"
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
      "Traits",
      "Confetti",
      "PFP"
    ],
    "correctRoast": "Correct. Taxes survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Crypto and NFT activity may have tax consequences depending on location.",
    "i18n": {
      "en": {
        "prompt": "What records may matter after purchases and sales?",
        "correct": "Taxes",
        "wrong": [
          "Traits",
          "Confetti",
          "PFP"
        ]
      },
      "fr": {
        "prompt": "Quels registres peuvent compter après achats et ventes ?",
        "correct": "Taxes",
        "wrong": [
          "Traits",
          "Confetti",
          "PFP"
        ]
      },
      "es": {
        "prompt": "¿Qué registros pueden importar después de compras y ventas?",
        "correct": "Impuestos",
        "wrong": [
          "Rasgos",
          "Confeti",
          "PFP"
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
      "Bookmark",
      "Listing",
      "Trait"
    ],
    "correctRoast": "Correct. Bridge survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Bridges add contract, network, and operational complexity.",
    "i18n": {
      "en": {
        "prompt": "What route between chains adds extra risk?",
        "correct": "Bridge",
        "wrong": [
          "Bookmark",
          "Listing",
          "Trait"
        ]
      },
      "fr": {
        "prompt": "Quelle route entre chaînes ajoute un risque supplémentaire ?",
        "correct": "Bridge",
        "wrong": [
          "Favori",
          "Listing",
          "Trait"
        ]
      },
      "es": {
        "prompt": "¿Qué ruta entre cadenas añade riesgo extra?",
        "correct": "Bridge",
        "wrong": [
          "Marcador",
          "Listing",
          "Rasgo"
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
      "Audits",
      "Guarantees",
      "Receipts"
    ],
    "correctRoast": "Correct. Marketing survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Influencer posts can be biased, sponsored, or wrong.",
    "i18n": {
      "en": {
        "prompt": "What should public hype claims be treated as?",
        "correct": "Marketing",
        "wrong": [
          "Audits",
          "Guarantees",
          "Receipts"
        ]
      },
      "fr": {
        "prompt": "Comme quoi faut-il traiter les affirmations hype publiques ?",
        "correct": "Marketing",
        "wrong": [
          "Audits",
          "Garanties",
          "Reçus"
        ]
      },
      "es": {
        "prompt": "¿Cómo deben tratarse las afirmaciones públicas de hype?",
        "correct": "Marketing",
        "wrong": [
          "Auditorías",
          "Garantías",
          "Recibos"
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
      "Verified",
      "Official",
      "Cached"
    ],
    "correctRoast": "Correct. Guaranteed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Guaranteed profit language is a common red flag.",
    "i18n": {
      "en": {
        "prompt": "Which promise is a classic scam signal?",
        "correct": "Guaranteed",
        "wrong": [
          "Verified",
          "Official",
          "Cached"
        ]
      },
      "fr": {
        "prompt": "Quelle promesse est un signal classique d'arnaque ?",
        "correct": "Garanti",
        "wrong": [
          "Vérifié",
          "Officiel",
          "Caché"
        ]
      },
      "es": {
        "prompt": "¿Qué promesa es una señal clásica de estafa?",
        "correct": "Garantizado",
        "wrong": [
          "Verificado",
          "Oficial",
          "Cacheado"
        ]
      }
    }
  },
  {
    "id": "squig-internal-017",
    "tier": 4,
    "category": "Privacy",
    "prompt": "What helps separate public identity from storage?",
    "correct": "Privacy",
    "wrong": [
      "Volume",
      "Ranking",
      "Confetti"
    ],
    "correctRoast": "Correct. Privacy survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Wallet separation can reduce privacy leakage and risk concentration.",
    "i18n": {
      "en": {
        "prompt": "What helps separate public identity from storage?",
        "correct": "Privacy",
        "wrong": [
          "Volume",
          "Ranking",
          "Confetti"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui aide à séparer identité publique et stockage ?",
        "correct": "Vieprivée",
        "wrong": [
          "Volume",
          "Classement",
          "Confetti"
        ]
      },
      "es": {
        "prompt": "¿Qué ayuda a separar identidad pública y almacenamiento?",
        "correct": "Privacidad",
        "wrong": [
          "Volumen",
          "Ranking",
          "Confeti"
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
      "Safer",
      "Empty",
      "Verified"
    ],
    "correctRoast": "Correct. Risky survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Shared devices can expose sessions, screens, extensions, or secrets.",
    "i18n": {
      "en": {
        "prompt": "How should shared computers be treated for wallet use?",
        "correct": "Risky",
        "wrong": [
          "Safer",
          "Empty",
          "Verified"
        ]
      },
      "fr": {
        "prompt": "Comment traiter les ordinateurs partagés pour l'usage wallet ?",
        "correct": "Risque",
        "wrong": [
          "Sûr",
          "Vide",
          "Vérifié"
        ]
      },
      "es": {
        "prompt": "¿Cómo tratar computadores compartidos para usar wallets?",
        "correct": "Riesgo",
        "wrong": [
          "Seguro",
          "Vacío",
          "Verificado"
        ]
      }
    }
  },
  {
    "id": "squig-internal-019",
    "tier": 4,
    "category": "Persistent Orders",
    "prompt": "What can remain active until canceled or expired?",
    "correct": "Offer",
    "wrong": [
      "Trait",
      "Image",
      "Username"
    ],
    "correctRoast": "Correct. Offer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Offers and listings can persist according to marketplace rules.",
    "i18n": {
      "en": {
        "prompt": "What can remain active until canceled or expired?",
        "correct": "Offer",
        "wrong": [
          "Trait",
          "Image",
          "Username"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut rester actif jusqu'à annulation ou expiration ?",
        "correct": "Offre",
        "wrong": [
          "Trait",
          "Image",
          "Pseudo"
        ]
      },
      "es": {
        "prompt": "¿Qué puede seguir activo hasta cancelarse o expirar?",
        "correct": "Oferta",
        "wrong": [
          "Rasgo",
          "Imagen",
          "Usuario"
        ]
      }
    }
  },
  {
    "id": "squig-internal-020",
    "tier": 4,
    "category": "Configuration",
    "prompt": "What should app code use for the official collection identifier?",
    "correct": "Config",
    "wrong": [
      "Chat",
      "Logo",
      "Rumor"
    ],
    "correctRoast": "Correct. Config survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Configuration or official sources should be the source of truth, not lore text or chat.",
    "i18n": {
      "en": {
        "prompt": "What should app code use for the official collection identifier?",
        "correct": "Config",
        "wrong": [
          "Chat",
          "Logo",
          "Rumor"
        ]
      },
      "fr": {
        "prompt": "Que doit utiliser le code app pour l'identifiant officiel de collection ?",
        "correct": "Config",
        "wrong": [
          "Chat",
          "Logo",
          "Rumeur"
        ]
      },
      "es": {
        "prompt": "¿Qué debe usar el código para el identificador oficial de colección?",
        "correct": "Config",
        "wrong": [
          "Chat",
          "Logo",
          "Rumor"
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
      "FOMO",
      "Flex",
      "Guess"
    ],
    "correctRoast": "Correct. Setup survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A safe path includes wallet setup, funding, verification, and risk awareness.",
    "i18n": {
      "en": {
        "prompt": "What should be completed before shopping for a Squig?",
        "correct": "Setup",
        "wrong": [
          "FOMO",
          "Flex",
          "Guess"
        ]
      },
      "fr": {
        "prompt": "Que faut-il compléter avant d'acheter un Squig ?",
        "correct": "Setup",
        "wrong": [
          "FOMO",
          "Flex",
          "Hasard"
        ]
      },
      "es": {
        "prompt": "¿Qué debe completarse antes de comprar un Squig?",
        "correct": "Setup",
        "wrong": [
          "FOMO",
          "Flex",
          "Azar"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-002",
    "tier": 5,
    "category": "Withdrawals",
    "prompt": "What must match before moving ETH from an exchange?",
    "correct": "Network",
    "wrong": [
      "Hairstyle",
      "Banner",
      "Rarity"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Network mismatch can trap assets away from the intended app or wallet.",
    "i18n": {
      "en": {
        "prompt": "What must match before moving ETH from an exchange?",
        "correct": "Network",
        "wrong": [
          "Hairstyle",
          "Banner",
          "Rarity"
        ]
      },
      "fr": {
        "prompt": "Que doit correspondre avant de déplacer ETH depuis un exchange ?",
        "correct": "Réseau",
        "wrong": [
          "Coiffure",
          "Bannière",
          "Rareté"
        ]
      },
      "es": {
        "prompt": "¿Qué debe coincidir antes de mover ETH desde un exchange?",
        "correct": "Red",
        "wrong": [
          "Peinado",
          "Banner",
          "Rareza"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-003",
    "tier": 5,
    "category": "Final Checks",
    "prompt": "Which final wallet detail helps avoid fake collections?",
    "correct": "Contract",
    "wrong": [
      "Color",
      "Emoji",
      "Volume"
    ],
    "correctRoast": "Correct. Contract survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The contract in the final prompt should match the verified collection.",
    "i18n": {
      "en": {
        "prompt": "Which final wallet detail helps avoid fake collections?",
        "correct": "Contract",
        "wrong": [
          "Color",
          "Emoji",
          "Volume"
        ]
      },
      "fr": {
        "prompt": "Quel détail final du wallet aide à éviter les fausses collections ?",
        "correct": "Contrat",
        "wrong": [
          "Couleur",
          "Emoji",
          "Volume"
        ]
      },
      "es": {
        "prompt": "¿Qué detalle final del wallet ayuda a evitar colecciones falsas?",
        "correct": "Contrato",
        "wrong": [
          "Color",
          "Emoji",
          "Volumen"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-004",
    "tier": 5,
    "category": "Support",
    "prompt": "What should be refused when anyone offers recovery help?",
    "correct": "Seed",
    "wrong": [
      "Ticket",
      "Link",
      "Status"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Recovery help should never require wallet recovery secrets.",
    "i18n": {
      "en": {
        "prompt": "What should be refused when anyone offers recovery help?",
        "correct": "Seed",
        "wrong": [
          "Ticket",
          "Link",
          "Status"
        ]
      },
      "fr": {
        "prompt": "Que faut-il refuser si quelqu'un propose de l'aide de récupération ?",
        "correct": "Seed",
        "wrong": [
          "Ticket",
          "Lien",
          "Statut"
        ]
      },
      "es": {
        "prompt": "¿Qué debe rechazarse si alguien ofrece ayuda de recuperación?",
        "correct": "Semilla",
        "wrong": [
          "Ticket",
          "Enlace",
          "Estado"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-005",
    "tier": 5,
    "category": "Lost Funds",
    "prompt": "Which mismatch can make withdrawn assets hard to access?",
    "correct": "Network",
    "wrong": [
      "Floor",
      "Trait",
      "Metadata"
    ],
    "correctRoast": "Correct. Network survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Sending on the wrong network can make assets difficult or impossible to recover.",
    "i18n": {
      "en": {
        "prompt": "Which mismatch can make withdrawn assets hard to access?",
        "correct": "Network",
        "wrong": [
          "Floor",
          "Trait",
          "Metadata"
        ]
      },
      "fr": {
        "prompt": "Quelle incompatibilité peut rendre des actifs retirés difficiles d'accès ?",
        "correct": "Réseau",
        "wrong": [
          "Floor",
          "Trait",
          "Métadonnées"
        ]
      },
      "es": {
        "prompt": "¿Qué incompatibilidad puede dificultar acceso a activos retirados?",
        "correct": "Red",
        "wrong": [
          "Floor",
          "Rasgo",
          "Metadatos"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-006",
    "tier": 5,
    "category": "Collection Authenticity",
    "prompt": "What confirms a marketplace page belongs to the real project?",
    "correct": "Verification",
    "wrong": [
      "Discount",
      "Confetti",
      "Ranking"
    ],
    "correctRoast": "Correct. Verification survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Verification through official links and contract checks helps avoid impostors.",
    "i18n": {
      "en": {
        "prompt": "What confirms a marketplace page belongs to the real project?",
        "correct": "Verification",
        "wrong": [
          "Discount",
          "Confetti",
          "Ranking"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui confirme qu'une page marketplace appartient au vrai projet ?",
        "correct": "Vérification",
        "wrong": [
          "Promo",
          "Confetti",
          "Classement"
        ]
      },
      "es": {
        "prompt": "¿Qué confirma que una página de marketplace pertenece al proyecto real?",
        "correct": "Verificación",
        "wrong": [
          "Descuento",
          "Confeti",
          "Ranking"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-007",
    "tier": 5,
    "category": "Offer Review",
    "prompt": "What should be reviewed before accepting a large bid?",
    "correct": "Currency",
    "wrong": [
      "Compliment",
      "Thumbnail",
      "Floor"
    ],
    "correctRoast": "Correct. Currency survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Large offers can use unexpected currencies, terms, or expiration rules.",
    "i18n": {
      "en": {
        "prompt": "What should be reviewed before accepting a large bid?",
        "correct": "Currency",
        "wrong": [
          "Compliment",
          "Thumbnail",
          "Floor"
        ]
      },
      "fr": {
        "prompt": "Que faut-il vérifier avant d'accepter une grosse offre ?",
        "correct": "Devise",
        "wrong": [
          "Compliment",
          "Miniature",
          "Floor"
        ]
      },
      "es": {
        "prompt": "¿Qué debe revisarse antes de aceptar una oferta grande?",
        "correct": "Moneda",
        "wrong": [
          "Cumplido",
          "Miniatura",
          "Floor"
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
      "Stickers",
      "Profiles",
      "Names"
    ],
    "correctRoast": "Correct. Assets survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Broad approvals can expose valuable wallet assets.",
    "i18n": {
      "en": {
        "prompt": "What can a malicious broad permission move?",
        "correct": "Assets",
        "wrong": [
          "Stickers",
          "Profiles",
          "Names"
        ]
      },
      "fr": {
        "prompt": "Que peut déplacer une permission large et malveillante ?",
        "correct": "Actifs",
        "wrong": [
          "Stickers",
          "Profils",
          "Noms"
        ]
      },
      "es": {
        "prompt": "¿Qué puede mover un permiso amplio y malicioso?",
        "correct": "Activos",
        "wrong": [
          "Stickers",
          "Perfiles",
          "Nombres"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-009",
    "tier": 5,
    "category": "Storage",
    "prompt": "What should protect valuable Squigs after purchase?",
    "correct": "Vault",
    "wrong": [
      "Browser",
      "DM",
      "Tab"
    ],
    "correctRoast": "Correct. Vault survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A low-interaction vault wallet reduces exposure for valuable assets.",
    "i18n": {
      "en": {
        "prompt": "What should protect valuable Squigs after purchase?",
        "correct": "Vault",
        "wrong": [
          "Browser",
          "DM",
          "Tab"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui doit protéger les Squigs précieux après achat ?",
        "correct": "Coffre",
        "wrong": [
          "Navigateur",
          "DM",
          "Onglet"
        ]
      },
      "es": {
        "prompt": "¿Qué debería proteger Squigs valiosos después de comprar?",
        "correct": "Bóveda",
        "wrong": [
          "Navegador",
          "DM",
          "Pestaña"
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
      "Traits",
      "Contract",
      "Token"
    ],
    "correctRoast": "Correct. Buyers survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "NFT liquidity can change quickly; buyers are not guaranteed.",
    "i18n": {
      "en": {
        "prompt": "What can vanish before a seller finds a fair price?",
        "correct": "Buyers",
        "wrong": [
          "Traits",
          "Contract",
          "Token"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui peut disparaître avant qu'un vendeur trouve un bon prix ?",
        "correct": "Acheteurs",
        "wrong": [
          "Traits",
          "Contrat",
          "Token"
        ]
      },
      "es": {
        "prompt": "¿Qué puede desaparecer antes de que un vendedor encuentre buen precio?",
        "correct": "Compradores",
        "wrong": [
          "Rasgos",
          "Contrato",
          "Token"
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
      "Clicking",
      "Signing",
      "Sending"
    ],
    "correctRoast": "Correct. Verification survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Urgent migration messages are common phishing bait and should be verified.",
    "i18n": {
      "en": {
        "prompt": "What should urgent migration posts trigger first?",
        "correct": "Verification",
        "wrong": [
          "Clicking",
          "Signing",
          "Sending"
        ]
      },
      "fr": {
        "prompt": "Que doivent déclencher d'abord les annonces de migration urgente ?",
        "correct": "Vérification",
        "wrong": [
          "Cliquer",
          "Signer",
          "Envoyer"
        ]
      },
      "es": {
        "prompt": "¿Qué deben provocar primero los anuncios de migración urgente?",
        "correct": "Verificación",
        "wrong": [
          "Clic",
          "Firmar",
          "Enviar"
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
      "Discord",
      "Wallet",
      "Twitter"
    ],
    "correctRoast": "Correct. Explorer survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A block explorer confirms public transaction and ownership state.",
    "i18n": {
      "en": {
        "prompt": "What public tool checks purchase status independently?",
        "correct": "Explorer",
        "wrong": [
          "Discord",
          "Wallet",
          "Twitter"
        ]
      },
      "fr": {
        "prompt": "Quel outil public vérifie indépendamment le statut d'achat ?",
        "correct": "Explorer",
        "wrong": [
          "Discord",
          "Wallet",
          "Twitter"
        ]
      },
      "es": {
        "prompt": "¿Qué herramienta pública verifica independientemente el estado de compra?",
        "correct": "Explorer",
        "wrong": [
          "Discord",
          "Wallet",
          "Twitter"
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
      "Refresh",
      "Panic",
      "Transfer"
    ],
    "correctRoast": "Correct. Ownership survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Display delays do not necessarily mean ownership failed.",
    "i18n": {
      "en": {
        "prompt": "What should be checked when new art is not visible yet?",
        "correct": "Ownership",
        "wrong": [
          "Refresh",
          "Panic",
          "Transfer"
        ]
      },
      "fr": {
        "prompt": "Que faut-il vérifier quand le nouvel art n'est pas encore visible ?",
        "correct": "Propriété",
        "wrong": [
          "Rafraîchir",
          "Panique",
          "Transfert"
        ]
      },
      "es": {
        "prompt": "¿Qué se debe revisar cuando el arte nuevo aún no aparece?",
        "correct": "Propiedad",
        "wrong": [
          "Refrescar",
          "Pánico",
          "Transferir"
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
      "Hide",
      "Delete",
      "Yell"
    ],
    "correctRoast": "Correct. Delist survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Listings may remain active until canceled through marketplace rules.",
    "i18n": {
      "en": {
        "prompt": "What cancels an unwanted sale order?",
        "correct": "Delist",
        "wrong": [
          "Hide",
          "Delete",
          "Yell"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui annule un ordre de vente non désiré ?",
        "correct": "Delister",
        "wrong": [
          "Cacher",
          "Supprimer",
          "Crier"
        ]
      },
      "es": {
        "prompt": "¿Qué cancela una orden de venta no deseada?",
        "correct": "Delistar",
        "wrong": [
          "Ocultar",
          "Borrar",
          "Gritar"
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
      "Evaporate",
      "Sleep",
      "Apologize"
    ],
    "correctRoast": "Correct. Execute survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Active offers can execute if their terms are met before cancellation or expiration.",
    "i18n": {
      "en": {
        "prompt": "What can old wrapped bids still do while active?",
        "correct": "Execute",
        "wrong": [
          "Evaporate",
          "Sleep",
          "Apologize"
        ]
      },
      "fr": {
        "prompt": "Que peuvent encore faire d'anciennes offres emballées actives ?",
        "correct": "Exécuter",
        "wrong": [
          "Évaporer",
          "Dormir",
          "Excuser"
        ]
      },
      "es": {
        "prompt": "¿Qué pueden hacer ofertas envueltas viejas mientras siguen activas?",
        "correct": "Ejecutar",
        "wrong": [
          "Evaporar",
          "Dormir",
          "Disculpar"
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
      "Theme",
      "Avatar",
      "History"
    ],
    "correctRoast": "Correct. Seed survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Without a secure recovery backup, self-custody access can be permanently lost.",
    "i18n": {
      "en": {
        "prompt": "What must be backed up before device loss?",
        "correct": "Seed",
        "wrong": [
          "Theme",
          "Avatar",
          "History"
        ]
      },
      "fr": {
        "prompt": "Que faut-il sauvegarder avant la perte d'un appareil ?",
        "correct": "Seed",
        "wrong": [
          "Thème",
          "Avatar",
          "Historique"
        ]
      },
      "es": {
        "prompt": "¿Qué debe respaldarse antes de perder un dispositivo?",
        "correct": "Semilla",
        "wrong": [
          "Tema",
          "Avatar",
          "Historial"
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
      "Traits",
      "Fees",
      "Stickers"
    ],
    "correctRoast": "Correct. Wallets survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Separate wallets can reduce privacy exposure and limit damage from risky activity.",
    "i18n": {
      "en": {
        "prompt": "What separates public identity from vault storage?",
        "correct": "Wallets",
        "wrong": [
          "Traits",
          "Fees",
          "Stickers"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui sépare l'identité publique du stockage coffre ?",
        "correct": "Wallets",
        "wrong": [
          "Traits",
          "Frais",
          "Stickers"
        ]
      },
      "es": {
        "prompt": "¿Qué separa identidad pública del almacenamiento bóveda?",
        "correct": "Wallets",
        "wrong": [
          "Rasgos",
          "Tarifas",
          "Stickers"
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
      "Profit",
      "Signal",
      "Alpha"
    ],
    "correctRoast": "Correct. Education survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "The game teaches concepts and does not promise profit or provide financial advice.",
    "i18n": {
      "en": {
        "prompt": "What is this onboarding game instead of financial advice?",
        "correct": "Education",
        "wrong": [
          "Profit",
          "Signal",
          "Alpha"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce que ce jeu d'onboarding au lieu d'un conseil financier ?",
        "correct": "Éducation",
        "wrong": [
          "Profit",
          "Signal",
          "Alpha"
        ]
      },
      "es": {
        "prompt": "¿Qué es este juego de onboarding en vez de consejo financiero?",
        "correct": "Educación",
        "wrong": [
          "Ganancia",
          "Señal",
          "Alpha"
        ]
      }
    }
  },
  {
    "id": "squig-impossible-019",
    "tier": 5,
    "category": "Final Pause",
    "prompt": "What should interrupt final-second buying pressure?",
    "correct": "Pause",
    "wrong": [
      "Speed",
      "Pride",
      "Noise"
    ],
    "correctRoast": "Correct. Pause survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "A final pause helps catch wrong sites, contracts, networks, amounts, and permissions.",
    "i18n": {
      "en": {
        "prompt": "What should interrupt final-second buying pressure?",
        "correct": "Pause",
        "wrong": [
          "Speed",
          "Pride",
          "Noise"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui doit interrompre la pression d'achat finale ?",
        "correct": "Pause",
        "wrong": [
          "Vitesse",
          "Fierté",
          "Bruit"
        ]
      },
      "es": {
        "prompt": "¿Qué debe interrumpir la presión final de compra?",
        "correct": "Pausa",
        "wrong": [
          "Velocidad",
          "Orgullo",
          "Ruido"
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
      "Luck",
      "Volume",
      "Hype"
    ],
    "correctRoast": "Correct. Safety survives the Ugly Labs clipboard.",
    "wrongRoast": "Wrong. That choice smells like shortcut paperwork.",
    "explanation": "Responsible buying means verifying sources, understanding wallet prompts, and accepting risk.",
    "i18n": {
      "en": {
        "prompt": "What best describes responsible Squig buying?",
        "correct": "Safety",
        "wrong": [
          "Luck",
          "Volume",
          "Hype"
        ]
      },
      "fr": {
        "prompt": "Qu'est-ce qui décrit le mieux un achat Squig responsable ?",
        "correct": "Sécurité",
        "wrong": [
          "Chance",
          "Volume",
          "Hype"
        ]
      },
      "es": {
        "prompt": "¿Qué describe mejor una compra Squig responsable?",
        "correct": "Seguridad",
        "wrong": [
          "Suerte",
          "Volumen",
          "Hype"
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

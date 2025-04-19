const sampleStory = {
    "title": "The Wizard's Trial",
    "currentPhase": 1,
    "phases": {
      "1": {
        "title": "The Summons",
        "content": "The ancient wizard Morgath summons you to his tower. 'To prove your worth, retrieve my stolen Amulet of Stars from the Cave of Whispers. But beware - the cave tests both courage and wisdom.' He hands you a lantern that glows blue near magic.",
        "choices": [
          {"text": "Head straight to the cave", "nextPhase": 2},
          {"text": "Research the cave in the library first", "nextPhase": 3},
          {"text": "Ask the wizard for more information", "nextPhase": 4}
        ],
        "type": "normal"
      },
      "2": {
        "title": "Rash Decisions",
        "content": "You rush to the cave entrance, where the lantern glows violently blue. A shadowy figure blocks the path: 'Answer my riddle or face consequences.' You didn't prepare for this!",
        "choices": [
          {"text": "Attempt the riddle anyway", "nextPhase": 5},
          {"text": "Attack the figure", "nextPhase": 6}
        ],
        "type": "normal"
      },
      "3": {
        "title": "Wise Preparation",
        "content": "The library scrolls reveal the cave is guarded by a sphinx who asks riddles. You study ancient lore late into the night, memorizing several solutions.",
        "choices": [
          {"text": "Approach the cave at dawn", "nextPhase": 7}
        ],
        "type": "normal"
      },
      "4": {
        "title": "The Wizard's Advice",
        "content": "Morgath sighs. 'The guardian respects patience. Bring this silver bell - ring it when in doubt.' He gives you a small chime that smells of lavender.",
        "choices": [
          {"text": "Proceed to the cave", "nextPhase": 8}
        ],
        "type": "normal"
      },
      "5": {
        "title": "Failed Riddle",
        "content": "'What walks on four legs at dawn, two at noon, and three at evening?' You guess incorrectly. The sphinx's eyes glow red as she curses you to wander the cave forever.",
        "choices": [],
        "type": "failure"
      },
      "6": {
        "title": "Foolish Attack",
        "content": "Your sword passes through the shadowy figure harmlessly. It laughs and transforms into a swarm of bats that carry you away into darkness.",
        "choices": [],
        "type": "failure"
      },
      "7": {
        "title": "Sphinx's Challenge",
        "content": "The sphinx asks: 'What must be broken before you can use it?' Thanks to your research, you confidently answer: 'An egg.' She bows and reveals the amulet.",
        "choices": [
          {"text": "Take the amulet back to Morgath", "nextPhase": 9}
        ],
        "type": "normal"
      },
      "8": {
        "title": "The Silver Solution",
        "content": "When the path divides in darkness, you ring the bell. The right path glows blue. At the amulet's pedestal, ghostly hands try to distract you, but the bell's tone clears your mind.",
        "choices": [
          {"text": "Claim the amulet carefully", "nextPhase": 9},
          {"text": "Grab it quickly", "nextPhase": 10}
        ],
        "type": "normal"
      },
      "9": {
        "title": "Triumphant Return",
        "content": "Morgath smiles as you present the amulet. 'You passed the true test - using both courage and wisdom.' He names you apprentice, and your magical training begins.",
        "choices": [],
        "type": "success"
      },
      "10": {
        "title": "Hasty Mistake",
        "content": "The amulet crumbles to dust in your hands - it was an illusion! The real amulet disappears forever as the cave collapses around you.",
        "choices": [],
        "type": "failure"
      }
    }
  };
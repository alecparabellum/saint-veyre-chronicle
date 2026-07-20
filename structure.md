# Saint Veyre Repository Structure

## Root

```text
/
├── CampaignPrompt.md
├── structure.md
├── Public/
└── Storyteller/
```

---

## Public

```text
Public/
├── Characters/
│   └── One folder per public character
├── Current/
│   └── Current campaign state visible to the player
├── Handouts/
│   ├── Letters/
│   ├── Newspapers/
│   ├── Contracts/
│   └── Other player-facing documents
├── Visual/
│   ├── Characters/
│   │   ├── CharacterVisualProfile_Template.md
│   │   └── One folder per character visual profile
│   ├── Locations/
│   │   └── One folder per location visual profile
│   ├── Factions/
│   │   └── One folder per faction or institution visual profile
│   ├── PromptTemplates/
│   │   └── Reusable image-generation templates
│   └── Reference/
│       └── Continuity, variation, review, and naming tools
└── World/
    ├── Public world information
    └── VisualArtBible.md
```

---

## Storyteller

```text
Storyteller/
├── Characters/
│   └── One folder per major NPC
├── Arcs/
│   └── One folder per campaign arc
├── Current/
│   └── Current Storyteller session state
├── Visual/
│   └── Spoiler-sensitive visual profiles, prompts, clues, and covers
├── ST_AncientChronicles.md
├── ST_FoundationalTruth.md
├── ST_LongTermConspiracies.md
└── ST_TrueHistory.md
```

---

## Conventions

```text
Public/Characters/{CharacterName}/
    Character information, portraits, and character-specific handouts.

Public/Visual/Characters/{CharacterName}/
    Public visual profile and image-direction notes for the character.

Storyteller/Characters/{CharacterName}/
    Hidden character information for a specific NPC.

Storyteller/Visual/{Category}/{SubjectName}/
    Spoiler-sensitive visual information or unrevealed image concepts.

Public/Handouts/{Category}/
    Handout categories.

Storyteller/Arcs/ArcXX/
    Arc planning documents.
```

Public visual profiles must not reveal hidden motives, secret affiliations, unrevealed transformations, or undiscovered supernatural traits.

---

## Structure Maintenance

Update this file only when:

- Creating a new category.
- Creating a new organizational convention.

Do not update this file when:

- Creating a character.
- Creating a handout.
- Creating an arc.
- Creating an ordinary content file.
- Adding a new visual profile within an established visual category.

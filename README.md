a family history documentation app that doesn't track genetic data or anything like that outright, but its basically a place where you can collaborate with family members to add information to the data structure such that no information or history is lost upon family member death. The core idea is inspired by: family trees directly correlating to tree data structures (each node is a person with their own personal information)

It's inspired by Obsidian, a notes app that allows you to keep these structured folders and such in the cloud or locally, and its all stored in markdown files.

**Data Structure**
- Family is a tree (graph with no cycles)
- Child nodes
- Marriage edges
- Adoption edges
- Event nodes
- Inside of person view have "bubbles"
	- Careers
	- Hobbies
	- Schools
	- Etc
- Data is stored in markdown files ultimately.

**Collaboration**
- Shareable and editable like Google Docs, could have comments that can be approved
- Photos can be uploaded
- Memories as a data member

**Ideas**
- Time based browsing
	- Use sorting by dates to remove people, events, data in general based on date
- Graph view (like obsidian)
	- People as nodes
	- Relationships as edges
	- Clusters of sub-families
	- Potentially tag-related feature like "worked together", "roommates", "business partners", etc
- Memories feed
	- BeReal history type thing, every 1, 2, 5, 10, 20, 30,...100... years something shows up in the memories feed
- OPTIONAL, toggle-able AI Assistant who, from a demeanor perspective, is like Jarvis, but is able to use retrieval to recount information asked about any event or person or data.
- Possibly add a switch you can flip that allows your family to reveal names to public (allowing for searching distant relatives) and there could potentially be message requests.
- Possibly add tree merging capabilities and ability to zoom in or out, viewing your close family, your nuclear family, or your technical whole family

**Data**
- User-owned data (all downloadable as a markdown)
- Local-only mode
- Optional cloud sync with encrypted storage
- "Rooted. Private. Yours"

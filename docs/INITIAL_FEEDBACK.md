
- Design the core data structure as a graph (Nodes = People, Edges = Relationships like Parent/Child, Spouse)
- Use the Markdown files as the **canonical source of truth** (for sync and export), but maintain a local **SQLite or IndexedDB** index that parses these files. The app should query the database for the graph view and search, but write back to Markdown files.
- **Mobile Framework:** You mentioned **Flutter** for mobile.
- We will use React Native for the mobile app in the future
- **Yjs** or **Automerge** are great choices. Since you want Markdown support, look into **Tiptap**, which has excellent Yjs integration for collaborative rich text/markdown editing.
- Build the app to work 100% offline using local storage (IndexedDB/WASM SQLite) first. Treat the cloud purely as a synchronization relay (using your proposed CRDTs) rather than the primary data store. This simplifies the "Optional cloud sync" requirement significantly.

Follow the phases as you described, I think thats a great idea:
*   **Phase 1 (Core):** Don't start with the UI. Start by defining the `Person`, `Relationship`, and `Event` schemas and ensuring you can serialize/deserialize them to Markdown/YAML frontmatter.
*   **Phase 2 (Graph Engine):** Implement the logic to traverse this data (e.g., "Find all ancestors of X").
*   **Phase 3 (Web UI):** Build the Next.js frontend to visualize this data.

For now, we can worry about getting the feel, technical workings of the core idea, and such right. Then from there, we can start worrying about security, data, scaling, etc. Now, I want you to start developing the website following the phases you mentioned, building the core logic first and then creating the corresponding Web UI to visualuze the data.


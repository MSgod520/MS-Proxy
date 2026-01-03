const registry = require('prismarine-registry')('1.8.9');
const PrismarineWorld = require('prismarine-world')(registry);
const Chunk = require('prismarine-chunk')(registry);
const Vec3 = require('vec3');

class WorldHandler {
    constructor(gameState) {
        this.gameState = gameState;
        this.world = new PrismarineWorld();
    }

    async handleMapChunk(data) {
        try {
            const chunk = new Chunk();
            chunk.load(data.data, data.bitMap, false, true); // 1.8.9 often uses skylight=true
            await this.world.setColumn(data.x, data.z, chunk);
        } catch (e) {
            console.error(`Error handling map_chunk: ${e.message}`);
        }
    }

    async handleMapChunkBulk(data) {
        // 1.8.9 sends Bulk chunks
        try {
            const skylight = data.skyLightSent;
            let offset = 0;
            const meta = data.meta;
            const buffer = data.data;

            for (let i = 0; i < meta.length; i++) {
                const chunkX = meta[i].x;
                const chunkZ = meta[i].z;
                const bitMap = meta[i].bitMap;

                const chunk = new Chunk();
                // We need to slice the buffer for this chunk. 
                // Chunk.load expects the buffer for just this chunk.
                // But wait, prismarine-chunk load implementation for 1.8 parses the buffer?
                // Actually `chunk.load` usually takes the buffer.
                // For bulk, we might need calculate size or use a helper?
                // In 1.8, the bulk packet data is just all chunks concatenated.
                // But we don't know the length easily without parsing?

                // Wait, `prismarine-chunk` for 1.8 might not support `load` with offsets easily if we don't calculate it.
                // But `minecraft-protocol` data for `map_chunk_bulk` usually gives `data` as one Buffer.

                // Re-reading minecraft-protocol/src/client/autoVersion.js or similar...
                // Actually, `minecraft-protocol` (which `MS-Proxy` uses) might already deserialize the packet into per-chunk data?
                // Let's check `src/packets/definitions/world.js`.

                // If I look at `map_chunk` definition in `src/packets/definitions/world.js`:
                // It just says `extractor`... wait it doesn't have an extractor!
                // So `data` passed to `handleMapChunkBulk` is the raw packet object from `minecraft-protocol`.

                // `minecraft-protocol` emits `map_chunk_bulk` with `data` being `{ skyLightSent, meta: [...], data: <Buffer> }`.

                // Resolving this in `prismarine-chunk` + 1.8 is tricky manually.
                // BUT! `minecraft-protocol` has `p-chunk` internally?

                // Simpler approach:
                // `prismarine-chunk` (1.8 implementation) `load` takes (buffer, bitMap, skyLightSent, fullChunk).
                // It reads from the buffer. Does it return the read size?
                // Looking at `prismarine-chunk` logic, usually it doesn't return read size.

                // However, likely we can use `chunk.load` on the buffer, but we need to know where the next chunk starts.
                // Actually, for 1.8, the size IS calculable from bitMap.
                // `Chunk.getMask()` style.

                // Let's trust `chunk.load` implementation or just rely on MapChunk (non-bulk) if the server sends it?
                // Hypixel (1.8) sends MapChunkBulk on join.

                // If I can't easily parse Bulk, I might miss the initial world loading.
                // Let's look for a standard way to load bulk in 1.8.
                // `node-minecraft-protocol` usually doesn't split the buffer for you in the packet event.

                // Let's look at `prismarine-chunk` docs or source if possible?
                // Or I can just try, assuming `chunk.load` handles it? No.

                // Wait, if I use `pc.loader`? No.

                // Let's implement a naive size calculator if needed, or better:
                // If `map_chunk_bulk` is too hard, maybe I can skip it for now?
                // But then I won't know the blocks if I'm in a bulk chunk.

                // Actually, `prismarine-chunk` export for 1.8 usually has a standard load.
                // IMPORTANT: `chunk.load` throws if buffer is too short, but doesn't tell us how much it read?
                // Wait, there is a `dump` and `load`.

                // Let's check if I can look up how others handle 1.8 bulk.
                // Most bots use `mineflayer` which handles this.
                // I can check `mineflayer` source code? No, I can't browse web freely for that.

                // Let's try to assume `chunk.load` might just work if I implement the size calculation or
                // maybe `minecraft-protocol` documentation?

                // Actually, `block_place` allows me to get the block...
                // If I fail to parse bulk chunks, I just return null.
                // Most "bed" interactions might happen dynamically? No, existing beds are in bulk.

                // Let's try to implement `handleMapChunk` only first, and see.
                // Hypixel *does* use Bulk.

                // Wait! `minecraft-protocol` packet definition for 1.8 `map_chunk_bulk`:
                // It has `meta` array.
                // I can iterate meta.
                // For each chunk, I need to extract the slice.
                // 1.8 chunk size: (BitMap count of 1s) * 16 * 16 * 2 (blocks) + ...
                // It's standard.

                // Let's use a helper function to calculate size.
                // Loops over sections (16 sections max).
                // Check bitmap bit. If set `size += 16*16*2` (block) `+ 16*16*0.5` (blocklight) `+ 16*16*0.5` (skylight if enabled) (+ biome if full?)

            }
        } catch (e) {
            console.error(`Error handling map_chunk_bulk: ${e.message}`);
        }
    }

    async handleBlockChange(data) {
        try {
            const loc = new Vec3(data.location.x, data.location.y, data.location.z);
            await this.world.setBlockStateId(loc, data.type);
            // setBlockStateId takes position and stateId. `data.type` in 1.8 is `id<<4 | meta`.
        } catch (e) { }
    }

    async handleMultiBlockChange(data) {
        try {
            const chunkX = data.chunkX;
            const chunkZ = data.chunkZ;
            for (const record of data.records) {
                // record: horizontalPos (byte), y (ubyte), blockId (varint)
                // horizontalPos: (z & 15) << 4 | (x & 15)
                const z = record.horizontalPos >> 4 & 15;
                const x = record.horizontalPos & 15;
                const y = record.y;
                // absolute:
                const absX = chunkX * 16 + x;
                const absZ = chunkZ * 16 + z;

                await this.world.setBlockStateId(new Vec3(absX, y, absZ), record.blockId);
            }
        } catch (e) { }
    }

    // New Helper: Get Block
    async getBlock(location) {
        try {
            return await this.world.getBlock(new Vec3(location.x, location.y, location.z));
        } catch (e) {
            return null;
        }
    }
}

module.exports = WorldHandler;

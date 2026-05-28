const LEVELS = [];

// 使用确定性的随机数生成器 (Mulberry32) 来保证每次生成的关卡数据完全固定
function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// 生成 20 个固定的关卡
for (let i = 0; i < 20; i++) {
    // 为每个关卡使用固定的种子
    const rng = mulberry32(i + 1024);
    
    const grid = [];
    for (let y = 0; y < 10; y++) {
        let row = [];
        for (let x = 0; x < 10; x++) {
            let val = 0;
            while (val === 0) {
                // 生成 -9 到 9 之间的随机数，不包含 0
                val = Math.floor(rng() * 19) - 9; 
            }
            row.push(val);
        }
        grid.push(row);
    }

    // 随机但固定的起点
    let startPos = {
        x: Math.floor(rng() * 10),
        y: Math.floor(rng() * 10)
    };

    // 随机但固定的终点（确保与起点不同）
    let endPos;
    do {
        endPos = {
            x: Math.floor(rng() * 10),
            y: Math.floor(rng() * 10)
        };
    } while (endPos.x === startPos.x && endPos.y === startPos.y);

    LEVELS.push({ grid, startPos, endPos });
}
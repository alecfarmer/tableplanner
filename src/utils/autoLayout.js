/**
 * Auto-layout presets for arranging tables on the canvas.
 * The sweetheart table is always positioned at the top center.
 * Guest tables are arranged below in the chosen pattern.
 */

// Table dimensions used for spacing calculations
const TABLE_SIZES = {
  sweetheart: { w: 260, h: 140 },
  round: { w: 200, h: 200 },
  rectangular: { w: 260, h: 180 },
};

function getSize(table) {
  return TABLE_SIZES[table.shape] || TABLE_SIZES.round;
}

/**
 * Classic layout: sweetheart at top center, guest tables in centered rows below.
 */
function layoutClassic(sweetheartTable, guestTables, canvasWidth) {
  const positions = {};
  const startY = 40;
  const rowGap = 60;
  const colGap = 40;

  // Place sweetheart table at top center
  if (sweetheartTable) {
    const sz = getSize(sweetheartTable);
    positions[sweetheartTable.id] = {
      x: Math.max(40, (canvasWidth - sz.w) / 2),
      y: startY,
    };
  }

  if (guestTables.length === 0) return positions;

  // Calculate how many tables per row based on canvas width
  const sampleSize = getSize(guestTables[0]);
  const tablesPerRow = Math.max(1, Math.floor((canvasWidth - 40) / (sampleSize.w + colGap)));
  const guestStartY = sweetheartTable
    ? startY + getSize(sweetheartTable).h + rowGap + 20
    : startY;

  for (let i = 0; i < guestTables.length; i++) {
    const row = Math.floor(i / tablesPerRow);
    const col = i % tablesPerRow;
    const tablesInThisRow = Math.min(tablesPerRow, guestTables.length - row * tablesPerRow);
    const sz = getSize(guestTables[i]);
    const rowWidth = tablesInThisRow * sz.w + (tablesInThisRow - 1) * colGap;
    const offsetX = (canvasWidth - rowWidth) / 2;

    positions[guestTables[i].id] = {
      x: Math.max(20, offsetX + col * (sz.w + colGap)),
      y: guestStartY + row * (sz.h + rowGap),
    };
  }

  return positions;
}

/**
 * U-shape layout: sweetheart at top center, tables arranged in a U below.
 */
function layoutUShape(sweetheartTable, guestTables, canvasWidth) {
  const positions = {};
  const startY = 40;
  const gap = 50;

  if (sweetheartTable) {
    const sz = getSize(sweetheartTable);
    positions[sweetheartTable.id] = {
      x: Math.max(40, (canvasWidth - sz.w) / 2),
      y: startY,
    };
  }

  if (guestTables.length === 0) return positions;

  const guestStartY = sweetheartTable
    ? startY + getSize(sweetheartTable).h + gap + 40
    : startY;

  const count = guestTables.length;

  if (count <= 3) {
    // Too few for a U, just place in a row
    return layoutClassic(sweetheartTable, guestTables, canvasWidth);
  }

  // Divide tables: left column, bottom row, right column
  const leftCount = Math.ceil((count - 1) / 3);
  const rightCount = Math.ceil((count - 1) / 3);
  const bottomCount = count - leftCount - rightCount;

  const leftTables = guestTables.slice(0, leftCount);
  const bottomTables = guestTables.slice(leftCount, leftCount + bottomCount);
  const rightTables = guestTables.slice(leftCount + bottomCount);

  const margin = 60;
  const uRight = canvasWidth - margin;
  const uLeft = margin;
  const verticalGap = gap;

  // Left column (top to bottom)
  for (let i = 0; i < leftTables.length; i++) {
    const sz = getSize(leftTables[i]);
    positions[leftTables[i].id] = {
      x: uLeft,
      y: guestStartY + i * (sz.h + verticalGap),
    };
  }

  // Calculate bottom row Y
  const lastLeftSz = leftTables.length > 0 ? getSize(leftTables[leftTables.length - 1]) : { h: 200 };
  const bottomY = guestStartY + (leftTables.length > 0 ? (leftTables.length - 1) * (lastLeftSz.h + verticalGap) + lastLeftSz.h + verticalGap : 0);

  // Bottom row (left to right, centered)
  if (bottomTables.length > 0) {
    const bSz = getSize(bottomTables[0]);
    const totalBottomW = bottomTables.length * bSz.w + (bottomTables.length - 1) * gap;
    const bottomStartX = (canvasWidth - totalBottomW) / 2;
    for (let i = 0; i < bottomTables.length; i++) {
      positions[bottomTables[i].id] = {
        x: Math.max(20, bottomStartX + i * (bSz.w + gap)),
        y: bottomY,
      };
    }
  }

  // Right column (bottom to top)
  for (let i = 0; i < rightTables.length; i++) {
    const sz = getSize(rightTables[i]);
    const idx = rightTables.length - 1 - i;
    positions[rightTables[i].id] = {
      x: uRight - sz.w,
      y: guestStartY + idx * (sz.h + verticalGap),
    };
  }

  return positions;
}

/**
 * Banquet layout: sweetheart at top center, long rectangular rows below.
 */
function layoutBanquet(sweetheartTable, guestTables, canvasWidth) {
  const positions = {};
  const startY = 40;
  const gap = 30;
  const rowGap = 80;

  if (sweetheartTable) {
    const sz = getSize(sweetheartTable);
    positions[sweetheartTable.id] = {
      x: Math.max(40, (canvasWidth - sz.w) / 2),
      y: startY,
    };
  }

  if (guestTables.length === 0) return positions;

  const guestStartY = sweetheartTable
    ? startY + getSize(sweetheartTable).h + rowGap
    : startY;

  // Place tables in two columns (banquet-style parallel rows)
  const tablesPerRow = Math.max(1, Math.ceil(guestTables.length / 2));
  const leftColumn = guestTables.filter((_, i) => i % 2 === 0);
  const rightColumn = guestTables.filter((_, i) => i % 2 === 1);

  const centerGap = 100;
  const leftX = (canvasWidth - centerGap) / 2 - (getSize(leftColumn[0] || guestTables[0]).w);
  const rightX = (canvasWidth + centerGap) / 2;

  for (let i = 0; i < leftColumn.length; i++) {
    const sz = getSize(leftColumn[i]);
    positions[leftColumn[i].id] = {
      x: Math.max(20, leftX),
      y: guestStartY + i * (sz.h + gap),
    };
  }

  for (let i = 0; i < rightColumn.length; i++) {
    const sz = getSize(rightColumn[i]);
    positions[rightColumn[i].id] = {
      x: Math.min(canvasWidth - sz.w - 20, rightX),
      y: guestStartY + i * (sz.h + gap),
    };
  }

  return positions;
}

/**
 * Scattered layout: sweetheart at top center, tables in a staggered organic pattern.
 */
function layoutScattered(sweetheartTable, guestTables, canvasWidth) {
  const positions = {};
  const startY = 40;
  const rowGap = 70;

  if (sweetheartTable) {
    const sz = getSize(sweetheartTable);
    positions[sweetheartTable.id] = {
      x: Math.max(40, (canvasWidth - sz.w) / 2),
      y: startY,
    };
  }

  if (guestTables.length === 0) return positions;

  const guestStartY = sweetheartTable
    ? startY + getSize(sweetheartTable).h + rowGap + 20
    : startY;

  // Staggered rows: alternate between 2 and 3 tables per row with offset
  let y = guestStartY;
  let idx = 0;

  while (idx < guestTables.length) {
    const rowNum = Math.floor(idx / 3);
    const isOddRow = rowNum % 2 === 1;
    const tablesInRow = Math.min(isOddRow ? 2 : 3, guestTables.length - idx);

    for (let col = 0; col < tablesInRow; col++) {
      const t = guestTables[idx];
      const sz = getSize(t);
      const totalW = tablesInRow * sz.w + (tablesInRow - 1) * 60;
      const offsetX = (canvasWidth - totalW) / 2 + (isOddRow ? 30 : 0);
      positions[t.id] = {
        x: Math.max(20, Math.min(canvasWidth - sz.w - 20, offsetX + col * (sz.w + 60))),
        y,
      };
      idx++;
    }

    const lastSz = getSize(guestTables[Math.min(idx - 1, guestTables.length - 1)]);
    y += lastSz.h + rowGap;
  }

  return positions;
}

export const LAYOUT_PRESETS = [
  { id: 'classic', name: 'Classic Rows', description: 'Centered rows of tables' },
  { id: 'u-shape', name: 'U-Shape', description: 'Tables in a U formation' },
  { id: 'banquet', name: 'Banquet', description: 'Parallel facing rows' },
  { id: 'scattered', name: 'Scattered', description: 'Staggered organic pattern' },
];

/**
 * Compute auto-layout positions for all tables.
 * @param {string} preset - Layout preset id
 * @param {Array} tables - All tables
 * @param {number} canvasWidth - Available canvas width (default 1200)
 * @returns {Object} Map of tableId -> { x, y }
 */
export function computeAutoLayout(preset, tables, canvasWidth = 1200) {
  // Separate sweetheart from guest tables
  const sweetheartTable = tables.find((t) => t.shape === 'sweetheart') || null;
  const guestTables = tables.filter((t) => t.shape !== 'sweetheart');

  switch (preset) {
    case 'u-shape':
      return layoutUShape(sweetheartTable, guestTables, canvasWidth);
    case 'banquet':
      return layoutBanquet(sweetheartTable, guestTables, canvasWidth);
    case 'scattered':
      return layoutScattered(sweetheartTable, guestTables, canvasWidth);
    case 'classic':
    default:
      return layoutClassic(sweetheartTable, guestTables, canvasWidth);
  }
}

/**
 * 生成 favicon.ico 的脚本
 * 需要先安装 sharp: npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

// 检查是否安装了 sharp
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('错误: 需要安装 sharp 库');
  console.error('请运行: npm install --save-dev sharp');
  process.exit(1);
}

const svgPath = path.join(__dirname, '../src/favicon.svg');
const icoPath = path.join(__dirname, '../src/favicon.ico');

// 读取 SVG 文件
const svgBuffer = fs.readFileSync(svgPath);

// 生成多个尺寸的 ICO
const sizes = [16, 32, 48];

Promise.all(
  sizes.map(size =>
    sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer()
  )
)
  .then(buffers => {
    // 创建 ICO 文件头
    const icoHeader = Buffer.alloc(6);
    icoHeader.writeUInt16LE(0, 0); // Reserved
    icoHeader.writeUInt16LE(1, 2); // Type (1 = ICO)
    icoHeader.writeUInt16LE(sizes.length, 4); // Number of images

    // 创建 ICO 目录条目
    let offset = 6 + sizes.length * 16;
    const directoryEntries = buffers.map((buffer, index) => {
      const entry = Buffer.alloc(16);
      const size = sizes[index];
      
      entry.writeUInt8(size === 256 ? 0 : size, 0); // Width
      entry.writeUInt8(size === 256 ? 0 : size, 1); // Height
      entry.writeUInt8(0, 2); // Color palette
      entry.writeUInt8(0, 3); // Reserved
      entry.writeUInt16LE(1, 4); // Color planes
      entry.writeUInt16LE(32, 6); // Bits per pixel
      entry.writeUInt32LE(buffer.length, 8); // Image size
      entry.writeUInt32LE(offset, 12); // Offset
      
      offset += buffer.length;
      return entry;
    });

    // 合并所有数据
    const icoFile = Buffer.concat([
      icoHeader,
      ...directoryEntries,
      ...buffers
    ]);

    // 写入文件
    fs.writeFileSync(icoPath, icoFile);
    console.log('✓ favicon.ico 生成成功!');
    console.log(`  位置: ${icoPath}`);
    console.log(`  尺寸: ${sizes.join(', ')}px`);
  })
  .catch(err => {
    console.error('生成 favicon.ico 时出错:', err);
    process.exit(1);
  });



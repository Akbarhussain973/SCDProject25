const Record = require('./models/Record');
const recordUtils = require('./record');
const vaultEvents = require('../events');
const fs = require('fs');
const path = require('path');


async function addRecord({ name, value }) {
    recordUtils.validateRecord({ name, value });
    const record = new Record({ name, value });
    await record.save();

    backupVault(await Record.find({})); // backup all records after add
    vaultEvents.emit('recordAdded', record);
    return record;
}


async function listRecords() {
    return await Record.find({});
}


async function updateRecord(id, newName, newValue) {
    const updated = await Record.findByIdAndUpdate(
        id,
        { name: newName, value: newValue, modified: new Date() },
        { new: true }
    );

    if (updated) backupVault(await Record.find({}));
    if (updated) vaultEvents.emit('recordUpdated', updated);
    return updated;
}


async function searchRecords(keyword) {
    return await Record.find({
        $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { value: { $regex: keyword, $options: 'i' } }
        ]
    });
}



async function deleteRecord(id) {
    const deleted = await Record.findByIdAndDelete(id);
    if (deleted) backupVault(await Record.find({}));
    if (deleted) vaultEvents.emit('recordDeleted', deleted);
    return deleted;
}



function backupVault(vault) {
  const now = new Date();
  const filename = `backup_${now.toISOString().replace(/[:.]/g, '-')}.json`;

  const backupDir = path.join(__dirname, '../backups'); // parent directory
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  fs.writeFileSync(
    path.join(backupDir, filename),
    JSON.stringify(vault, null, 2)
  );

  console.log(`🗂️ Backup created: ${filename}`);
}


async function sortRecords(field, order) {
    return await Record.find({}).sort({ [field]: order === 'asc' ? 1 : -1 });
}


async function exportData() {
    const records = await Record.find({});
    const now = new Date();
    let data =
        `===== Vault Export =====\nExport Date: ${now.toISOString()}\nTotal Records: ${records.length}\nOutput File: export.txt\n\n`;

    records.forEach(r => {
        data += `ID: ${r._id} | Name: ${r.name} | Value: ${r.value} | Created: ${r.created.toISOString()}\n`;
    });

    fs.writeFileSync('export.txt', data);
    console.log("📄 Exported vault to export.txt");
    return true;
}

async function viewVaultStats() {
    const vault = await Record.find({});
    if (vault.length === 0) {
        console.log("📊 No records available to analyze.");
        return;
    }

    const total = vault.length;
    const lastModified = new Date(Math.max(...vault.map(r => new Date(r.modified || r.created))));
    const longestName = vault.reduce((a,b) => a.name.length > b.name.length ? a : b, { name: '' });
    const createdDates = vault.map(r => new Date(r.created));
    const earliest = new Date(Math.min(...createdDates));
    const latest = new Date(Math.max(...createdDates));

    console.log('\n===== Vault Statistics =====');
    console.log(`Total Records: ${total}`);
    console.log(`Last Modified: ${lastModified.toISOString()}`);
    console.log(`Longest Name: ${longestName.name} (${longestName.name.length} characters)`);
    console.log(`Earliest Created Record: ${earliest.toISOString().split('T')[0]}`);
    console.log(`Latest Created Record: ${latest.toISOString().split('T')[0]}`);
    console.log('=============================\n');
}




module.exports = { addRecord, listRecords, updateRecord, searchRecords, deleteRecord, sortRecords, exportData, backupVault, viewVaultStats };

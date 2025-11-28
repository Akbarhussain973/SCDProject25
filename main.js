const readline = require('readline');
const db = require('./db');
require('./events/logger');
const connectDB = require('./db/mangodb');

(async () => {
    await connectDB();
    console.log("Vault App Connected to MongoDB");
    await menu();
})();

async function menu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const questionAsync = query => new Promise(resolve => rl.question(query, resolve));

    while (true) {
        console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Search Record
5. Delete Record
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
        `);

        const ans = await questionAsync('Choose option: ');

        switch (ans.trim()) {
            case '1': {
                const name = await questionAsync('Enter name: ');
                const value = await questionAsync('Enter value: ');
                await db.addRecord({ name, value });
                console.log('✅ Record added successfully!');
                break;
            }
            case '2': {
                const records = await db.listRecords();
                if (records.length === 0) console.log('No records found.');
                else records.forEach(r => console.log(`ID: ${r._id} | Name: ${r.name} | Value: ${r.value}`));
                break;
            }
            case '3': {
                const id = await questionAsync('Enter record ID to update: ');
                const name = await questionAsync('New name: ');
                const value = await questionAsync('New value: ');
                const updated = await db.updateRecord(id, name, value);
                console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
                break;
            }
            case '4': {
                const keyword = await questionAsync('Enter search keyword: ');
                const results = await db.searchRecords(keyword);
                if (results.length === 0) console.log('❌ No matching records found.');
                else results.forEach(r => console.log(`ID: ${r._id} | Name: ${r.name} | Value: ${r.value}`));
                break;
            }
            case '5': {
                const id = await questionAsync('Enter record ID to delete: ');
                const deleted = await db.deleteRecord(id);
                console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
                break;
            }
            case '6': {
                const field = await questionAsync('Sort by (name/value): ');
                const order = await questionAsync('Order (asc/desc): ');
                const sorted = await db.sortRecords(field.toLowerCase(), order.toLowerCase());
                if (sorted.length === 0) console.log('❌ No records found.');
                else sorted.forEach(r => console.log(`ID: ${r._id} | Name: ${r.name} | Value: ${r.value}`));
                break;
            }
            case '7':
                await db.exportData();
                console.log('📄 Data exported successfully to export.txt!');
                break;
            case '8':
                await db.viewVaultStats();
                break;
            case '9':
                console.log('👋 Exiting NodeVault...');
                rl.close();
                process.exit(0);
                break;
            default:
                console.log('Invalid option.');
        }
    }
}


import fs from 'fs';


const jsonFilePath = 'output.json';

fs.readFile(jsonFilePath, 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        return;
    }

    try {
        const jsonData = JSON.parse(data);

        const dataArray = jsonData.data;

        dataArray.forEach((value) => {
            // console.log('Processing value:', value);

            const parts = value[0].split(' ');
            const firstPart = parts[0];

            console.log('First part:', firstPart);

        });

        console.log('Operations complete.');
    } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
    }
});





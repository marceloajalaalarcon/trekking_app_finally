const http = require('http');

http.get('http://localhost:3333/trekkings', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.length > 0) {
                const id = parsed[0].id;
                console.log(`First event ID: ${id}`);
                http.get(`http://localhost:3333/trekkings/${id}`, (res2) => {
                    let data2 = '';
                    res2.on('data', chunk => data2 += chunk);
                    res2.on('end', () => console.log('Single event:', data2));
                });
            }
        } catch (e) { console.error(e) }
    });
});

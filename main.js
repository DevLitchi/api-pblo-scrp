const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');

    console.log('Cargando página de pedido...');
    await page.goto("https://www.mcmaster.com/order/rcvRtedOrd.aspx?ordid=8045124887158&lnktyp=txt", { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('.line-catalog-link', { visible: true });

    console.log('Extrayendo datos del carrito...');

    const data = await page.evaluate(() => {
        const partNumbers = Array.from(document.querySelectorAll('.line-part-number-input')).map(sn => sn.value.trim());
        return { partNumbers };
    });

    console.log('Números de parte extraídos:', data.partNumbers);

    // Generar enlaces con los números de parte
    const partLinks = data.partNumbers.map(part => `https://www.mcmaster.com/${part}`);

    console.log('\nConsultando detalles de cada artículo...\n');

    let detailedProducts = {};

    for (let i = 0; i < partLinks.length; i++) {
        const link = partLinks[i];
        const partPage = await browser.newPage();
        console.log(`Abriendo: ${link}`);
        await partPage.goto(link, { waitUntil: 'domcontentloaded' });

        await partPage.waitForSelector('.ProductDetailTableRow_product-detail-spec-table-row__17kFE', { visible: true });

        const productDetails = await partPage.evaluate(() => {
            const title = document.querySelector('.ProductDetailHeaders_productDetailHeaderPrimary__29zSz')?.innerText.trim() || 'No disponible';

            const specifications = Array.from(document.querySelectorAll('.ProductDetailTableRow_product-detail-spec-table-row__17kFE'))
                .reduce((acc, row) => {
                    const text = row.innerText.trim();
                    const splitText = text.split("\n\t\n\n");
                    if (splitText.length === 2) {
                        acc[splitText[0].trim()] = splitText[1].trim();
                    }
                    return acc;
                }, {});

            return { title, specifications };
        });

        detailedProducts[`articulo_${i + 1}`] = {
            Titulo: productDetails.title,
            detalles: productDetails.specifications
        };

        await partPage.close();
    }

    await browser.close();

    // Formatear la salida en JSON con la estructura solicitada
    const carrito = { Carrito: detailedProducts };
    console.log(JSON.stringify(carrito, null, 2));
})();

import ollama from 'ollama';
import readline from 'readline';
import fetch from 'node-fetch';
import puppeteer from 'puppeteer';

// Desactivar la verificación del certificado SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  async function downloadImageFromUrl(url) {
    try {
      const response = await fetch(url);
      const rawData = await response.arrayBuffer();
      const int8Array = new Uint8Array(rawData);
      console.log("🚀 ~ downloadImage ~ int8Array:", int8Array)

      return int8Array;
    } catch (error) {
      console.error('Error al descargar la imagen:', error);
      return null;
    }
  }


function describeImageFromUrl() {
    downloadImageFromUrl('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8O1FzPq2TmED7WQwPr329Cc9xEEK6KBeGdv-Gq3Twdol69b4MUkSA8mAQwUSBQRJEnHc&usqp=CAU')
    .then(async (base64Img) => {
        if (base64Img) {
            console.log('hay data en la foto analizando con llava....');
            const response = await ollama.chat({
                model: 'llava',
                stream: true,
                messages: [{
                    role: 'system',
                    content: 'Contesta siempre en español'
                }, {
                    role: 'user',
                    content: '¿Sabes quien es el personaje que aparece en la foto?',
                    images: [base64Img]
                }]
            });

            for await (const part of response) {
                rl.output.write(part.message.content);
            }
        }
    });
}


async function capturarImagenDeURL(url, rutaGuardado){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Ir a la URL especificada
    await page.goto(url);

    // Tomar una captura de pantalla de toda la página
    await page.screenshot({ path: rutaGuardado });

    // Cerrar el navegador
    await browser.close();

    console.log(`Captura de pantalla de ${url} guardada en ${rutaGuardado}`);

    return true;
}


function captureImgFromUrlAndDescribe() {
// Llamar a la función para capturar la imagen
capturarImagenDeURL('https://www.binance.com/es/price/bitcoin', 'captura.png').then(async () => {
    console.log('generando respuesta...');
        const response = await ollama.chat({
            model: 'llava',
            stream: true,
            messages: [{
                role: 'system',
                content: 'Contesta siempre en español'
            }, {
                role: 'user',
                content: '¿Me podrías decir el valor del Bitcoin que aparece en la imagen?',
                images: ['./captura.png']
            }]
        });

        for await (const part of response) {
            rl.output.write(part.message.content);
        }
        
    }); 
}


describeImageFromUrl();
// captureImgFromUrlAndDescribe();
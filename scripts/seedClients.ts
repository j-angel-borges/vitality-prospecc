import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '../src/firebase/config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const clients = [
  {
    "numero_cliente": "28240957",
    "nombre": "MARISOL DE JESUS",
    "apellido": "DIAZ PEREIRA",
    "telefono_movil": "9-296-3045",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SAN MIGUEL",
    "direccion": "CALLE JOSEFINA RAMON DE COX 153",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 11/04/2026 | F. Último Pedido: 11/04/2026 | F. Último Pago: N/A | F. Cierre: 11/16/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102440497 (10/31/2026) - Precio Venta: S/. 8,008.47 | IGV: S/. 1,441.53 | Envío: S/. 0.00 | Total: S/. 9,450.00"
  },
  {
    "numero_cliente": "28208418",
    "nombre": "SILVIA MARLENE",
    "apellido": "ESPINOZA ORIHUELA",
    "telefono_movil": "3-246-6684",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "JESUS MARIA",
    "direccion": "AV JOSE ARNOLDO MARQUEZ 679 DEPTO 205",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 09/27/2026 | F. Último Pedido: 09/27/2026 | F. Último Pago: N/A | F. Cierre: 11/09/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102355434 (09/18/2026) - Precio Venta: S/. 542.37 | IGV: S/. 97.63 | Envío: S/. 0.00 | Total: S/. 640.00"
  },
  {
    "numero_cliente": "28199046",
    "nombre": "ELIZABETH",
    "apellido": "MEJIA DUQUE",
    "telefono_movil": "9-214-8321",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "LA MOLINA",
    "direccion": "CALLE 1 RIVIERA 164 CUADRA 14 AV ACAPULCO",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 09/16/2026 | F. Último Pedido: 09/16/2026 | F. Último Pago: N/A | F. Cierre: 10/31/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102329626 (09/13/2026) - Precio Venta: S/. 2,072.03 | IGV: S/. 372.97 | Envío: S/. 0.00 | Total: S/. 2,445.00"
  },
  {
    "numero_cliente": "28199020",
    "nombre": "LORENA",
    "apellido": "VILLALOBOS EGGERSTEDT",
    "telefono_movil": "6-235-7944",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SURQUILLO",
    "direccion": "CALE LA RATONA 287 287 APTO 302",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 09/15/2026 | F. Último Pedido: 09/15/2026 | F. Último Pago: N/A | F. Cierre: 10/27/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102329629 (09/13/2026) - Precio Venta: S/. 1,483.05 | IGV: S/. 266.95 | Envío: S/. 0.00 | Total: S/. 1,750.00"
  },
  {
    "numero_cliente": "28194521",
    "nombre": "ZELIKA LIZ",
    "apellido": "KUMAKAWA SAAVEDRA",
    "telefono_movil": "7-503-7000",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SAN BARTOLO",
    "direccion": "AV PARQUE OLAYA 164 DPTO 101",
    "informacion_cuenta": "Tipo: Closed End | Nivel Fin.: 5 | Método: Cheque | Pago mín.: S/. 1,094.00 | F. Orden Original: 09/10/2026 | F. Último Pedido: 09/10/2026 | F. Último Pago: 11/10/2026 | F. Cierre: 10/22/2026 | Saldo Actual: S/. 4,372.00 | Factor Ingresos: S/. 7,000.00 | Crédito Disp.: S/. 2,628.00 | Estado: Actual",
    "ordenes": "Orden #102317578 (09/07/2026) - Precio Venta: S/. 6,830.51 | IGV: S/. 1,229.49 | Envío: S/. 0.00 | Total: S/. 8,060.00"
  },
  {
    "numero_cliente": "28193166",
    "nombre": "MARISEL ROCIO",
    "apellido": "BETETA SALAS",
    "telefono_movil": "5-152-3063",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SANTIAGO DE SURCO",
    "direccion": "CALLE PINEROLO 149 PISO 12 DPTO 204",
    "informacion_cuenta": "Tipo: Revolving | Nivel Fin.: 2 | Método: Cheque | Pago mín.: S/. 270.00 | F. Orden Original: 09/11/2026 | F. Último Pedido: 09/11/2026 | F. Último Pago: 10/25/2026 | F. Cierre: 10/23/2026 | Saldo Actual: S/. 3,894.31 | Factor Ingresos: N/A | Crédito Disp.: N/A | Estado: Actual",
    "ordenes": "Orden #102313306 (09/04/2026) - Precio Venta: S/. 3,771.19 | IGV: S/. 678.81 | Envío: S/. 0.00 | Total: S/. 4,450.00"
  },
  {
    "numero_cliente": "28191631",
    "nombre": "CLAUDIA ANALI",
    "apellido": "PINAZZO VALLEJOS",
    "telefono_movil": "5-160-1930",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SAN BORJA",
    "direccion": "AV SAN BORJA SUR 979 DPTO 501",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 09/07/2026 | F. Último Pedido: 09/07/2026 | F. Último Pago: N/A | F. Cierre: 10/19/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102309650 (09/02/2026) - Precio Venta: S/. 15,978.81 | IGV: S/. 2,876.19 | Envío: S/. 0.00 | Total: S/. 18,855.00"
  },
  {
    "numero_cliente": "28179908",
    "nombre": "JORGE MAGNO",
    "apellido": "RODRIGUEZ DIAZ",
    "telefono_movil": "7-537-3527",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "MIRAFLORES",
    "direccion": "CALLE ITALIA 412 DPT 1702",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 08/24/2026 | F. Último Pedido: 08/24/2026 | F. Último Pago: N/A | F. Cierre: 11/05/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102278908 (08/21/2026) - Precio Venta: S/. 6,329.66 | IGV: S/. 1,139.34 | Envío: S/. 0.00 | Total: S/. 7,469.00"
  },
  {
    "numero_cliente": "28176600",
    "nombre": "KATTYA DENNISE",
    "apellido": "REATEGUI ARCOS",
    "telefono_movil": "0-293-2321",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SAN BORJA",
    "direccion": "JIRON BENLLUIRE 201 CASA",
    "informacion_cuenta": "Tipo: Closed End | Nivel Fin.: 7 | Método: Cheque | Pago mín.: S/. 692.00 | F. Orden Original: 08/23/2026 | F. Último Pedido: 08/23/2026 | F. Último Pago: 11/10/2026 | F. Cierre: 11/04/2026 | Saldo Actual: S/. 2,766.00 | Factor Ingresos: S/. 4,150.00 | Crédito Disp.: S/. 1,384.00 | Estado: Actual",
    "ordenes": "Orden #102269677 (08/17/2026) - Precio Venta: S/. 4,381.36 | IGV: S/. 788.64 | Envío: S/. 0.00 | Total: S/. 5,170.00"
  },
  {
    "numero_cliente": "28174405",
    "nombre": "FABIOLA MALENA",
    "apellido": "ALEJANDRO CCALLUCO",
    "telefono_movil": "7-754-3036",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "LOS OLIVOS",
    "direccion": "JR RIO PAUCARTAMBO MZA CH1 LOTE 20 URB VILLA DEL NORTE",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 08/17/2026 | F. Último Pedido: 08/17/2026 | F. Último Pago: N/A | F. Cierre: 11/01/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102263782 (08/14/2026) - Precio Venta: S/. 7,769.49 | IGV: S/. 1,398.51 | Envío: S/. 0.00 | Total: S/. 9,168.00"
  },
  {
    "numero_cliente": "28164373",
    "nombre": "FIORELLA EVILYNG",
    "apellido": "EGGERSTEDT BARROSO",
    "telefono_movil": "2-255-6951",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "LA MOLINA",
    "direccion": "CL PURUCHUCO MZ E4 LT 64 PISO 3 URBANIZACION PORTADA DEL SOL ET 3",
    "informacion_cuenta": "Tipo: Revolving | Nivel Fin.: 2 | Método: Cheque | Pago mín.: S/. 885.00 | F. Orden Original: 08/04/2026 | F. Último Pedido: 08/13/2026 | F. Último Pago: 11/12/2026 | F. Cierre: 11/16/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 10,000.00 | Crédito Disp.: S/. 10,000.00 | Estado: Cancelación total",
    "ordenes": "Orden #102256451 (08/10/2026) - Precio Venta: S/. 1,847.46 | IGV: S/. 332.54 | Envío: S/. 0.00 | Total: S/. 2,180.00; Orden #102237081 (08/02/2026) - Precio Venta: S/. 6,737.29 | IGV: S/. 1,212.71 | Envío: S/. 0.00 | Total: S/. 7,950.00"
  },
  {
    "numero_cliente": "28164362",
    "nombre": "NADIA CRUZ",
    "apellido": "ACEVEDO SUAREZ",
    "telefono_movil": "3-921-2763",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "LINCE",
    "direccion": "JR DOMINGO CASANOVA 578 DPTO 301 578 DPTO 301",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 08/04/2026 | F. Último Pedido: 08/04/2026 | F. Último Pago: N/A | F. Cierre: 11/16/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102237048 (07/25/2026) - Precio Venta: S/. 6,266.10 | IGV: S/. 1,127.90 | Envío: S/. 0.00 | Total: S/. 7,394.00"
  },
  {
    "numero_cliente": "28155450",
    "nombre": "RICARDO RAFAEL",
    "apellido": "ERNAU VENEGAS",
    "telefono_movil": "5-484-9860",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SANTIAGO DE SURCO",
    "direccion": "1350 PASEO LA CASTELLANA DPTO1902",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 07/26/2026 | F. Último Pedido: 07/27/2026 | F. Último Pago: N/A | F. Cierre: 11/07/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102215515 (07/22/2026) - Precio Venta: S/. 694.92 | IGV: S/. 125.08 | Envío: S/. 0.00 | Total: S/. 820.00; Orden #102219930 (07/22/2026) - Precio Venta: S/. 6,067.80 | IGV: S/. 1,092.20 | Envío: S/. 0.00 | Total: S/. 7,160.00"
  },
  {
    "numero_cliente": "28095669",
    "nombre": "MARIA GUADALUPE PAULINA ALEJAND",
    "apellido": "REY DE CASTRO CAYO DE BUSTAMANTE",
    "telefono_movil": "4-992-9265",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "BARRANCO",
    "direccion": "MALECON PAZOS 102 DPT 201",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 05/13/2026 | F. Último Pedido: 05/13/2026 | F. Último Pago: N/A | F. Cierre: 10/25/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102056873 (05/11/2026) - Precio Venta: S/. 10,288.98 | IGV: S/. 1,852.02 | Envío: S/. 0.00 | Total: S/. 12,141.00"
  },
  {
    "numero_cliente": "28087059",
    "nombre": "ROCIO",
    "apellido": "LOPEZ DE ROMAÑA JENKINS",
    "telefono_movil": "9-037-1601",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "BARRANCO",
    "direccion": "MALECON PAZOS 102 DPTO 401",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 05/05/2026 | F. Último Pedido: 05/05/2026 | F. Último Pago: N/A | F. Cierre: 10/17/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102032210 (04/29/2026) - Precio Venta: S/. 1,902.54 | IGV: S/. 342.46 | Envío: S/. 0.00 | Total: S/. 2,245.00"
  },
  {
    "numero_cliente": "28087055",
    "nombre": "SHEILA MARIA",
    "apellido": "JENKINS DE LOPEZ DE ROMANA",
    "telefono_movil": "5-915-9194",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "BARRANCO",
    "direccion": "MALECON PAZOS 102 DPTO 401",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 05/04/2026 | F. Último Pedido: 05/04/2026 | F. Último Pago: N/A | F. Cierre: 11/16/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102032216 (04/29/2026) - Precio Venta: S/. 5,423.73 | IGV: S/. 976.27 | Envío: S/. 0.00 | Total: S/. 6,400.00"
  },
  {
    "numero_cliente": "28087054",
    "nombre": "PATRICIA",
    "apellido": "LOPEZ DE ROMANA JENKINS",
    "telefono_movil": "9-037-1602",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "BARRANCO",
    "direccion": "MALECON PAZOS 102 DTO 401",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 05/05/2026 | F. Último Pedido: 05/05/2026 | F. Último Pago: N/A | F. Cierre: 10/17/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102032194 (04/29/2026) - Precio Venta: S/. 1,556.78 | IGV: S/. 280.22 | Envío: S/. 0.00 | Total: S/. 1,837.00"
  },
  {
    "numero_cliente": "28080014",
    "nombre": "LUCY ISABEL",
    "apellido": "ORTIZ ESPINOZA",
    "telefono_movil": "4-043-2513",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "MIRAFLORES",
    "direccion": "CL SAN IGNACIO DE LOYOLA ALT CDRA 12 AV REDUCTO 569 DPT 601",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 04/26/2026 | F. Último Pedido: 05/14/2026 | F. Último Pago: N/A | F. Cierre: 11/08/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102062375 (05/14/2026) - Precio Venta: S/. 0.00 | IGV: S/. 0.00 | Envío: S/. 0.00 | Total: S/. 0.00; Orden #102016070 (04/22/2026) - Precio Venta: S/. 5,063.56 | IGV: S/. 911.44 | Envío: S/. 0.00 | Total: S/. 5,975.00"
  },
  {
    "numero_cliente": "28075384",
    "nombre": "DANIA PATRICIA",
    "apellido": "SUAREZ URBINA",
    "telefono_movil": "1-661-8212",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "TACNA",
    "distrito": "TACNA",
    "direccion": "CL BRASIL 260 SAN PEDRO",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 04/28/2026 | F. Último Pedido: 04/28/2026 | F. Último Pago: N/A | F. Cierre: 11/10/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #102004170 (04/15/2026) - Precio Venta: S/. 2,046.61 | IGV: S/. 368.39 | Envío: S/. 0.00 | Total: S/. 2,415.00"
  },
  {
    "numero_cliente": "28059894",
    "nombre": "NICHOL",
    "apellido": "NIEZEN MARQUEZ",
    "telefono_movil": "8-175-0878",
    "emprendedores": "BORJ0067 - JOSE ANGEL BORGES OLAIZOLA",
    "provincia": "LIMA",
    "distrito": "BARRANCO",
    "direccion": "AV EL SOL 385 DPTO 907",
    "informacion_cuenta": "Tipo: Revolving | Nivel Fin.: 6 | Método: Cheque | Pago mín.: S/. 990.00 | F. Orden Original: 04/06/2026 | F. Último Pedido: 04/06/2026 | F. Último Pago: 11/16/2026 | F. Cierre: 10/18/2026 | Saldo Actual: S/. 3,122.57 | Factor Ingresos: S/. 9,275.00 | Crédito Disp.: S/. 6,152.43 | Estado: Actual",
    "ordenes": "Orden #101961951 (03/26/2026) - Precio Venta: S/. 10,063.56 | IGV: S/. 1,811.44 | Envío: S/. 0.00 | Total: S/. 11,875.00"
  },
  {
    "numero_cliente": "28014198",
    "nombre": "GINA",
    "apellido": "DIAZ ORTIZ",
    "telefono_movil": "6-046-5333",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SAN MIGUEL",
    "direccion": "JR SAN MARTIN 749 DPT 106 BLOQUE. A",
    "informacion_cuenta": "Tipo: Revolving | Nivel Fin.: 6 | Método: Cheque | Pago mín.: S/. 300.00 | F. Orden Original: 02/23/2026 | F. Último Pedido: 02/23/2026 | F. Último Pago: 10/21/2026 | F. Cierre: 10/19/2026 | Saldo Actual: S/. 6,873.41 | Factor Ingresos: S/. 7,405.00 | Crédito Disp.: S/. 531.59 | Estado: Actual",
    "ordenes": "Orden #101842403 (02/07/2026) - Precio Venta: S/. 6,605.93 | IGV: S/. 1,189.07 | Envío: S/. 0.00 | Total: S/. 7,795.00"
  },
  {
    "numero_cliente": "28009546",
    "nombre": "HANS JHONATAN",
    "apellido": "ALVA DOBBERTIN",
    "telefono_movil": "7-622-5440",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "MAGDALENA DEL MAR",
    "direccion": "CALLE FAUSTINO SANCHEZ CARRION 140 JUSTO VIGIL 140 DPTO 502",
    "informacion_cuenta": "Tipo: Efectivo | Nivel Fin.: N/A | Método: Cheque | Pago mín.: S/. 0.00 | F. Orden Original: 02/04/2026 | F. Último Pedido: 02/04/2026 | F. Último Pago: N/A | F. Cierre: 11/16/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 0.00 | Crédito Disp.: S/. 0.00 | Estado: Cancelación total",
    "ordenes": "Orden #101828322 (02/02/2026) - Precio Venta: S/. 1,800.85 | IGV: S/. 324.15 | Envío: S/. 0.00 | Total: S/. 2,125.00"
  },
  {
    "numero_cliente": "27290277",
    "nombre": "SAM",
    "apellido": "SZTUDEN WOLFZON",
    "telefono_movil": "9-922-4847",
    "emprendedores": "OLAR0011 - RICFEL MARIOLI OLAIZOLA QUINTERO",
    "provincia": "LIMA",
    "distrito": "SAN ISIDRO",
    "direccion": "AV 2 DE MAYO 1259 DPTO 304",
    "informacion_cuenta": "Tipo: Closed End | Nivel Fin.: 5 | Método: Cheque | Pago mín.: S/. 1,559.00 | F. Orden Original: 06/03/2024 | F. Último Pedido: 09/15/2026 | F. Último Pago: 01/15/2025 | F. Cierre: 11/15/2026 | Saldo Actual: S/. 0.00 | Factor Ingresos: S/. 9,364.00 | Crédito Disp.: S/. 9,364.00 | Estado: Cancelación total",
    "ordenes": "Orden #102332198 (09/14/2026) - Precio Venta: S/. 605.93 | IGV: S/. 109.07 | Envío: S/. 0.00 | Total: S/. 715.00; Orden #100330206 (05/24/2024) - Precio Venta: S/. 8,465.25 | IGV: S/. 1,523.75 | Envío: S/. 0.00 | Total: S/. 9,989.00"
  }
];

function normalizePeruPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 8) {
    return `9${digits}`;
  }
  return digits;
}

async function seed() {
  console.log('--- Iniciando registro de Clientes en Firestore ---');

  // 1. Asegurar pestaña 'Clientes' en crm_settings/config
  const settingsDocRef = doc(db, 'crm_settings', 'config');
  try {
    const snap = await getDoc(settingsDocRef);
    let currentTabs = ['Prospecc', 'Clientes'];
    if (snap.exists() && Array.isArray(snap.data()?.sheetTabs)) {
      currentTabs = snap.data().sheetTabs;
      if (!currentTabs.includes('Clientes')) {
        currentTabs = ['Clientes', ...currentTabs];
      }
    }
    await setDoc(settingsDocRef, { sheetTabs: currentTabs, updatedAt: serverTimestamp() }, { merge: true });
    console.log('✅ Pestaña "Clientes" configurada en crm_settings/config');
  } catch (e) {
    console.warn('Advertencia en crm_settings:', e);
  }

  // 2. Insertar los 23 clientes en la colección 'leads'
  let count = 0;
  for (const c of clients) {
    const leadId = `hycite_${c.numero_cliente}`;
    const docRef = doc(db, 'leads', leadId);
    
    // Asignación de salesRep según código de emprendedor
    const isJoseAngel = c.emprendedores.includes('BORJ0067');
    const salesRep = isJoseAngel ? 'Jose Angel' : 'Ricfel';
    const normalizedPhone = normalizePeruPhone(c.telefono_movil);

    const leadPayload = {
      id: leadId,
      timestamp: new Date().toISOString(),
      nivelPreocupacion: 10,
      conocimientoDano: 'Cliente Verificado Hy Cite',
      edadHijos: '',
      preguntaCondicional: '',
      respuestaCondicional: '',
      interesSolucion: 'Sí',
      nombreMadre: `${c.nombre} ${c.apellido}`.trim(),
      celular: normalizedPhone,
      distrito: c.distrito,
      observaciones: `Cliente Hy Cite N° ${c.numero_cliente} (${c.direccion})`,
      gestCall: 'll',
      obserCalls: 'Cliente cerrado Hy Cite',
      callHistory: [],
      sheetTab: 'Clientes',
      estadoCrm: 'ganado',
      salesRep: salesRep,
      tipoLead: 'cliente',
      // Datos de Ficha de Cliente
      numeroCliente: c.numero_cliente,
      apellido: c.apellido,
      provincia: c.provincia,
      direccion: c.direccion,
      informacionCuenta: c.informacion_cuenta,
      ordenes: c.ordenes,
      emprendedores: c.emprendedores,
      clienteFicha: {
        numeroCliente: c.numero_cliente,
        nombre: c.nombre,
        apellido: c.apellido,
        telefonoMovil: normalizedPhone,
        emprendedores: c.emprendedores,
        provincia: c.provincia,
        distrito: c.distrito,
        direccion: c.direccion,
        informacionCuenta: c.informacion_cuenta,
        ordenes: c.ordenes
      },
      updatedAt: serverTimestamp()
    };

    await setDoc(docRef, leadPayload, { merge: true });
    count++;
    console.log(`[${count}/23] Guardado cliente: ${leadPayload.nombreMadre} (${c.numero_cliente}) -> Rep: ${salesRep}`);
  }

  console.log('🎉 Todos los 23 clientes han sido sincronizados exitosamente en Firestore.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Error durante la sincronización:', err);
  process.exit(1);
});

export type Service = {
  slug: string;
  name: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  image: string;
  imageAlt: string;
  sections: { heading: string; text: string }[];
  checklist: string[];
  faqs: { question: string; answer: string }[];
  related: string[];
};

export const services: Service[] = [
  {
    slug: "transporte-maritimo",
    name: "Transporte marítimo",
    title: "Transporte marítimo FCL y LCL en Argentina | Atlas Cargo",
    description: "Coordinamos fletes marítimos de importación y exportación en Argentina: contenedores completos FCL y carga consolidada LCL. Consultá por tu próximo embarque.",
    heading: "Transporte marítimo internacional desde y hacia Argentina",
    intro: "Coordinamos embarques de importación y exportación para empresas que necesitan mover mercadería por vía marítima. Evaluamos la ruta, el tipo de contenedor y el alcance del servicio, con seguimiento desde la reserva hasta la entrega acordada.",
    image: "/images/port.webp",
    imageAlt: "Buque portacontenedores y grúas en una terminal portuaria",
    sections: [
      { heading: "Contenedor completo: FCL", text: "La modalidad FCL permite reservar un contenedor para una misma operación. Es una alternativa para cargas de mayor volumen o embarques que necesitan una unidad dedicada. Revisamos peso, dimensiones, embalaje y condiciones de carga para evaluar el equipo adecuado y coordinar el retiro, el ingreso a terminal y el transporte internacional." },
      { heading: "Carga consolidada: LCL", text: "En un embarque LCL, tu mercadería comparte espacio con otras cargas. Puede resultar útil cuando el volumen no justifica un contenedor completo. Para comparar alternativas, consideramos el flete, los gastos de consolidación y desconsolidación, los puntos de recepción y los tiempos de cada etapa. La opción más conveniente depende del costo total y de la necesidad de entrega." },
      { heading: "Una cotización con el alcance definido", text: "Antes de reservar, precisamos qué tramos están incluidos: retiro en origen, flete internacional, gastos locales, coordinación documental y entrega en destino. También revisamos la condición de compra acordada con tu proveedor y la vigencia de la tarifa. Así podés comparar propuestas sobre la misma base y planificar los gastos de la operación." },
      { heading: "Documentación y seguimiento del embarque", text: "Coordinamos los datos operativos con las partes involucradas y el seguimiento de la reserva, salida y arribo. La factura comercial, la lista de empaque y las instrucciones del documento de transporte deben corresponder a la carga efectiva. Las fechas de salida y llegada se informan según la programación disponible y pueden cambiar durante la operación." },
    ],
    checklist: ["Puerto o dirección de origen y destino final.", "Descripción de la mercadería y condición de compra acordada.", "Cantidad de bultos, peso bruto y dimensiones o volumen.", "Tipo de contenedor, si ya está definido, y fecha de carga lista.", "Necesidad de retiro, entrega o condiciones especiales de manejo."],
    faqs: [
      { question: "¿Puedo cotizar si todavía no sé si necesito FCL o LCL?", answer: "Sí. Enviá el detalle de bultos, medidas, peso y ruta. Comparamos el alcance de ambas alternativas y la coordinación que requiere cada una." },
      { question: "¿El flete marítimo incluye todos los gastos de importación?", answer: "Depende de lo cotizado. El flete internacional es una parte de la operación; los gastos en origen y destino, la entrega y los conceptos aduaneros deben identificarse por separado según el alcance solicitado." },
      { question: "¿Se puede coordinar la entrega desde el puerto hasta mi depósito?", answer: "Podemos incluir la coordinación del tramo terrestre en la propuesta. Necesitamos conocer la dirección, las condiciones de acceso y cómo se realizará la descarga." },
    ],
    related: ["flete-china-argentina", "transporte-terrestre", "gestion-aduanera"],
  },
  {
    slug: "carga-aerea",
    name: "Carga aérea",
    title: "Carga aérea internacional en Argentina | Atlas Cargo",
    description: "Flete aéreo internacional para empresas: repuestos, equipos y mercadería de importación o exportación. Coordinación documental y operativa en Argentina.",
    heading: "Carga aérea internacional para empresas en Argentina",
    intro: "Cuando la fecha de entrega es determinante, coordinamos alternativas de transporte aéreo para repuestos, equipos y mercadería. Analizamos origen, destino, características de la carga y urgencia para definir una propuesta acorde a tu operación.",
    image: "/images/air.webp",
    imageAlt: "Avión y pallets en una plataforma de carga aeroportuaria",
    sections: [
      { heading: "Repuestos y equipos con plazos exigentes", text: "Una pieza necesaria para producción o una reposición de stock puede requerir una coordinación distinta a la de un embarque planificado. Para evaluar opciones necesitamos saber cuándo estará lista la carga, cuál es la fecha objetivo de recepción y si existe flexibilidad en la ruta. La disponibilidad se confirma para cada embarque." },
      { heading: "Peso, volumen y embalaje", text: "La cotización aérea considera tanto el peso como el espacio que ocupa la mercadería. Por eso, el peso de un producto sin su caja no alcanza para estimar el transporte. Pedimos las medidas exteriores y el peso bruto de cada bulto ya embalado; también revisamos si es apilable y si requiere manejo particular. El peso facturable se confirma bajo las condiciones del servicio elegido." },
      { heading: "Coordinación de origen a destino", text: "La propuesta puede contemplar el retiro en origen, la recepción de la carga, el tramo aéreo y la entrega final. Definimos los puntos de transferencia y coordinamos la información entre proveedor, transportistas y quienes intervienen en la documentación. El tiempo de vuelo es solo una parte del plazo total: también cuentan la recepción, los controles y la liberación en destino." },
      { heading: "Información completa antes de embarcar", text: "Si la mercadería contiene baterías, líquidos, componentes químicos o necesita temperatura controlada, avisalo desde la consulta inicial. Evaluamos la viabilidad con los operadores involucrados antes de confirmar la reserva. La aceptación y los documentos requeridos dependen de la naturaleza de la carga y del servicio disponible." },
    ],
    checklist: ["Direcciones de origen y destino, o aeropuertos solicitados.", "Cantidad de bultos y medidas exteriores de cada uno.", "Peso bruto con embalaje y descripción de la mercadería.", "Fecha de disponibilidad y fecha objetivo de entrega.", "Presencia de baterías u otras condiciones particulares."],
    faqs: [
      { question: "¿Por qué necesitan las medidas si ya informé el peso?", answer: "Porque el espacio ocupado puede influir en el peso facturable. Con peso y dimensiones podemos evaluar el servicio con más precisión y reducir diferencias al recibir la carga." },
      { question: "¿Puedo cotizar un repuesto urgente?", answer: "Sí. Compartí la ubicación de la carga, sus datos de embalaje y el plazo requerido. Revisamos las opciones disponibles antes de confirmar tiempos y condiciones." },
      { question: "¿El plazo informado incluye el despacho aduanero?", answer: "Se debe distinguir el tránsito aéreo del plazo total. El alcance y los tiempos previstos de recepción, documentación, liberación y entrega se revisan para cada operación." },
    ],
    related: ["gestion-aduanera", "transporte-terrestre", "cargas-proyecto"],
  },
  {
    slug: "transporte-terrestre",
    name: "Transporte terrestre",
    title: "Transporte terrestre de cargas en Argentina | Atlas Cargo",
    description: "Coordinación de retiros y entregas de carga en Argentina. Conectamos puertos, aeropuertos, depósitos y plantas con el destino final de tu operación.",
    heading: "Transporte terrestre para conectar cada tramo de tu carga",
    intro: "Coordinamos retiros y entregas entre puertos, aeropuertos, depósitos y plantas. Integramos el tramo terrestre a la operación logística para que la mercadería llegue al punto acordado con las condiciones de recepción previstas.",
    image: "/images/ground.webp",
    imageAlt: "Camión de carga junto a un centro logístico",
    sections: [
      { heading: "Del puerto o aeropuerto al destino final", text: "El arribo del transporte internacional no es el final de la operación. Hay que coordinar disponibilidad de la carga, documentación, turnos y recepción. Revisamos estos puntos antes de programar el vehículo para conectar el retiro con la entrega y evitar movimientos innecesarios." },
      { heading: "Un vehículo acorde a la mercadería", text: "La elección depende de las dimensiones, el peso, el embalaje y las condiciones de acceso. No es lo mismo trasladar pallets que un contenedor o un equipo que necesita una maniobra particular. Solicitamos el detalle de la carga y evaluamos con los transportistas la alternativa adecuada para ese recorrido." },
      { heading: "Planificar la carga y la descarga", text: "Necesitamos conocer horarios de atención, restricciones de ingreso y medios de descarga del destino. También si se requiere un turno o autorización previa. Al definir estas condiciones en la cotización, podemos identificar servicios adicionales y coordinar responsabilidades con el depósito o la planta receptora." },
      { heading: "Seguimiento durante el recorrido", text: "Mantenemos la coordinación entre las partes para informar el avance del traslado y atender novedades operativas. En entregas vinculadas a importaciones o exportaciones, articulamos el tramo terrestre con la documentación y los hitos del embarque internacional." },
    ],
    checklist: ["Direcciones completas de retiro y entrega.", "Tipo de carga, cantidad de bultos, peso y dimensiones.", "Fecha prevista y ventana horaria de recepción.", "Equipos disponibles para cargar y descargar.", "Restricciones de acceso, turnos o requisitos del establecimiento."],
    faqs: [
      { question: "¿Puedo incluir el transporte terrestre en el flete internacional?", answer: "Sí, podemos evaluar ambos tramos en una misma propuesta con los servicios y puntos de entrega definidos." },
      { question: "¿Qué pasa si el depósito no tiene medios de descarga?", answer: "Es necesario informarlo antes de cotizar. Revisamos qué solución de descarga requiere la operación y su disponibilidad." },
      { question: "¿Coordinan retiros desde una planta para exportación?", answer: "Podemos evaluar el retiro y su conexión con el embarque. Necesitamos los datos de la mercadería, la dirección de la planta y la programación prevista." },
    ],
    related: ["transporte-maritimo", "carga-aerea", "cargas-proyecto"],
  },
  {
    slug: "gestion-aduanera",
    name: "Coordinación aduanera",
    title: "Coordinación aduanera para importación y exportación | Atlas Cargo",
    description: "Acompañamiento documental y coordinación con los profesionales intervinientes para tus importaciones y exportaciones en Argentina. Consultá a Atlas Cargo.",
    heading: "Coordinación aduanera y documental para tu operación",
    intro: "Acompañamos la organización documental de importaciones y exportaciones y coordinamos con el despachante y los demás profesionales intervinientes. El objetivo es conectar la información de la carga con la planificación del transporte y la entrega.",
    image: "/images/port.webp",
    imageAlt: "Terminal portuaria utilizada en operaciones de comercio exterior",
    sections: [
      { heading: "Preparar la información antes de la salida", text: "La coordinación comienza con una descripción clara de la mercadería y la documentación disponible del proveedor. Compartir estos datos antes del embarque permite que los profesionales responsables revisen las condiciones de la operación y detecten información faltante a tiempo." },
      { heading: "Factura, packing list y documento de transporte", text: "Coordinamos la circulación de los documentos entre las partes. La factura comercial, la lista de empaque y el documento de transporte deben describir de forma consistente la operación. Si cambia la cantidad de bultos, el peso o los datos del envío, es importante comunicarlo para revisar la documentación correspondiente." },
      { heading: "Trabajar junto a tu despachante", text: "Si ya trabajás con un despachante, articulamos la logística con su equipo. Compartimos la programación y las novedades del embarque para organizar los pasos operativos. La clasificación de la mercadería, las intervenciones y las obligaciones aduaneras se evalúan con el profesional responsable del despacho según cada caso." },
      { heading: "Conectar liberación y entrega", text: "La fecha de arribo no equivale a la disponibilidad para retirar la carga. Coordinamos el seguimiento de los hitos informados por los intervinientes y, cuando corresponde, la programación del transporte terrestre. Esto permite organizar la recepción en tu depósito con información de la operación." },
    ],
    checklist: ["Descripción y uso de la mercadería.", "Factura comercial o proforma y lista de empaque disponibles.", "Origen, destino y condición de compra o venta.", "Datos del importador o exportador y contacto del despachante.", "Fecha prevista de embarque y documentación adicional disponible."],
    faqs: [
      { question: "¿Puedo operar con mi propio despachante?", answer: "Sí. Coordinamos con su equipo los documentos, la programación y las novedades logísticas del embarque." },
      { question: "¿Me indican los impuestos solo con el valor de la factura?", answer: "El valor por sí solo no alcanza. La evaluación depende de las características de la mercadería y de la operación, y se revisa con el profesional responsable del despacho." },
      { question: "¿Cuándo conviene empezar la revisión documental?", answer: "Antes de confirmar el embarque, con la información disponible del proveedor. Así pueden revisarse los requisitos de la operación y los datos que faltan." },
    ],
    related: ["transporte-maritimo", "carga-aerea", "flete-china-argentina"],
  },
  {
    slug: "cargas-proyecto",
    name: "Maquinaria y cargas de proyecto",
    title: "Logística de maquinaria y cargas de proyecto | Atlas Cargo",
    description: "Coordinación logística de maquinaria, equipos y cargas con requerimientos especiales. Evaluamos dimensiones, ruta, transporte y entrega para cada proyecto.",
    heading: "Logística para maquinaria, equipos y cargas de proyecto",
    intro: "Las cargas que tienen dimensiones, pesos o condiciones de manejo particulares necesitan una planificación específica. Evaluamos la operación con los proveedores involucrados para coordinar el transporte y las maniobras según las necesidades del proyecto.",
    image: "/images/ground.webp",
    imageAlt: "Transporte terrestre como parte de una operación logística de proyecto",
    sections: [
      { heading: "Empezar por la ficha técnica", text: "Para evaluar una máquina o un equipo necesitamos las dimensiones y el peso de transporte, no solo las medidas de uso. Fotografías, planos, puntos de izaje y detalles del embalaje ayudan a revisar cómo se puede mover. También es importante saber si el equipo puede desarmarse y quién prepara la carga en origen." },
      { heading: "Definir transporte y puntos de transferencia", text: "Analizamos la combinación de tramos marítimos, aéreos y terrestres que requiere el proyecto. La viabilidad depende de la carga, la ruta y la disponibilidad de equipos. Cada transferencia se revisa para determinar las condiciones de recepción y las maniobras necesarias antes de asumir un compromiso de embarque." },
      { heading: "Coordinar la entrega en planta u obra", text: "El destino necesita una revisión tan detallada como el origen. Accesos, espacio de maniobra, capacidad de descarga y ventanas de recepción pueden condicionar la operación. Solicitamos esta información para coordinar con los responsables de la planta, depósito u obra y definir el alcance de los servicios." },
      { heading: "Una propuesta adaptada al proyecto", text: "Organizamos los conceptos del transporte y los servicios adicionales que se hayan solicitado. Los requerimientos especiales se evalúan caso por caso con los operadores correspondientes. El alcance confirmado y las condiciones de cada tramo quedan definidos antes de coordinar la ejecución." },
    ],
    checklist: ["Ficha técnica, fotografías y planos disponibles.", "Peso y dimensiones de transporte de cada pieza.", "Embalaje, puntos de izaje y posibilidad de desarme.", "Ubicación de origen y condiciones de acceso al destino.", "Cronograma del proyecto y medios de carga y descarga."],
    faqs: [
      { question: "¿Puedo cotizar una máquina antes de comprarla?", answer: "Sí. La ficha técnica y los datos del proveedor permiten evaluar alternativas preliminares. El alcance se confirma con la información final de transporte y la disponibilidad de servicios." },
      { question: "¿Toda maquinaria necesita un transporte especial?", answer: "No necesariamente. Depende de sus medidas, peso, embalaje y condiciones de manejo. Revisamos esos datos para evaluar la alternativa apropiada." },
      { question: "¿Se pueden incluir maniobras de carga y descarga?", answer: "Podemos evaluar su coordinación dentro de la propuesta. Es necesario conocer las instalaciones y los requerimientos de cada maniobra para confirmar viabilidad y alcance." },
    ],
    related: ["transporte-maritimo", "transporte-terrestre", "carga-aerea"],
  },
  {
    slug: "flete-china-argentina",
    name: "Flete de China a Argentina",
    title: "Flete de China a Argentina: FCL y LCL | Atlas Cargo",
    description: "Cotizá el flete de China a Argentina para tu empresa. Evaluamos contenedor completo, carga consolidada, gastos de origen y destino y entrega final.",
    heading: "Flete de China a Argentina para importadores",
    intro: "Coordinamos transporte de mercadería desde China hacia Argentina y evaluamos el alcance según tu compra: contenedor completo, carga consolidada y conexión terrestre hasta el destino acordado. Partimos de los datos reales del proveedor y de tu carga.",
    image: "/images/port.webp",
    imageAlt: "Buque portacontenedores en una operación de transporte marítimo internacional",
    sections: [
      { heading: "El origen exacto cambia la cotización", text: "La ciudad de la fábrica y el puerto de salida no siempre coinciden. Para cotizar necesitamos saber dónde se entrega la mercadería y qué tramo tiene a cargo cada parte. Si el proveedor informa solamente un puerto, revisamos el alcance acordado para entender si el traslado hasta ese punto está incluido en la compra." },
      { heading: "Comparar contenedor completo y carga consolidada", text: "En FCL se evalúa una unidad dedicada a la operación; en LCL, el embarque comparte espacio con otras cargas. Para elegir no alcanza con mirar la tarifa del tramo marítimo. Consideramos volumen, peso, embalaje, gastos de origen y destino, y las etapas de consolidación que correspondan. Con esa base se puede comparar el costo del transporte de manera más completa." },
      { heading: "Revisar la condición de compra", text: "Si la propuesta de tu proveedor indica FOB, EXW u otra condición, compartí la cotización completa y el lugar acordado. Revisamos con las partes qué servicios logísticos necesitás contratar y cuáles ya están contemplados. Esto ayuda a evitar que una propuesta omita un tramo o que el mismo servicio se considere dos veces." },
      { heading: "Separar flete, gastos locales y entrega", text: "El presupuesto debe permitir reconocer el alcance de cada concepto. Además del transporte internacional, pueden intervenir retiros, gastos locales, servicios documentales y transporte hasta tu depósito. Los conceptos aduaneros se revisan con el profesional responsable. La vigencia, disponibilidad y condiciones del servicio se confirman para cada embarque." },
      { heading: "Planificar con la fecha de carga lista", text: "La producción terminada, el embalaje y la disponibilidad del proveedor son datos necesarios para coordinar la reserva. Trabajamos con la programación informada para organizar las etapas del envío. Los plazos se evalúan por ruta y servicio; el tránsito marítimo no representa por sí solo el tiempo total hasta la entrega en Argentina." },
    ],
    checklist: ["Ciudad del proveedor y puerto de salida propuesto.", "Destino en Argentina y necesidad de entrega a depósito.", "Condición de compra y lugar acordado con el proveedor.", "Packing list: bultos, peso bruto, medidas y volumen.", "Fecha de mercadería lista y tipo de contenedor, si está definido."],
    faqs: [
      { question: "¿Cuánto cuesta un contenedor de China a Argentina?", answer: "No hay una tarifa única: varía según origen, destino, tipo de contenedor, fecha, disponibilidad y alcance. Con los datos de la operación podemos preparar una propuesta con vigencia y conceptos definidos." },
      { question: "¿Puedo traer menos de un contenedor?", answer: "Sí, podemos evaluar carga consolidada LCL. Necesitamos conocer el volumen, el peso, el embalaje y las características de la mercadería para revisar esa alternativa." },
      { question: "¿Puedo cotizar si el proveedor ya me ofreció transporte?", answer: "Sí. Compartí el alcance de su propuesta para comparar servicios equivalentes, incluyendo los conceptos en origen y destino y el punto de entrega acordado." },
    ],
    related: ["transporte-maritimo", "gestion-aduanera", "transporte-terrestre"],
  },
];

export function getService(slug: string) {
  return services.find((service) => service.slug === slug);
}

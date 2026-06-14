// LLAVE - Simulador de Gastos de Escrituración
// Lógica interactiva y motor de cálculos

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Inputs
    const propValueInput = document.getElementById('prop-value');
    const propValueSlider = document.getElementById('prop-value-slider');
    const propValueDisplay = document.getElementById('prop-value-display');
    const locationCaba = document.getElementById('loc-caba');
    const locationPba = document.getElementById('loc-pba');
    const roleBuyer = document.getElementById('role-buyer');
    const roleSeller = document.getElementById('role-seller');
    const roleBoth = document.getElementById('role-both');
    const soleDwellingCheck = document.getElementById('sole-dwelling');
    const mortgageCheck = document.getElementById('mortgage');
    const mortgageSection = document.getElementById('mortgage-section');
    const financePctInput = document.getElementById('finance-pct');
    const financePctSlider = document.getElementById('finance-pct-slider');
    const sellerTaxSection = document.getElementById('seller-tax-section');
    const taxTypeIti = document.getElementById('tax-iti');
    const taxTypeGanancias = document.getElementById('tax-ganancias');
    const purchasePriceSection = document.getElementById('purchase-price-section');
    const purchaseValueInput = document.getElementById('purchase-value');

    // DOM Elements - Outputs
    const resultTotalLabel = document.getElementById('result-total-label');
    const resultTotalValue = document.getElementById('result-total-value');
    const resultPctDisplay = document.getElementById('result-pct-display');
    const singleResultBox = document.getElementById('single-result-box');
    const comparativeResultBox = document.getElementById('comparative-result-box');
    const compBuyerValue = document.getElementById('comp-buyer-value');
    const compSellerValue = document.getElementById('comp-seller-value');
    
    // Cost breakdown items container
    const costItemsList = document.getElementById('cost-items-list');
    
    // Buttons
    const themeToggle = document.getElementById('theme-toggle');
    const printBtn = document.getElementById('print-btn');
    const modalOverlay = document.getElementById('info-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalClose = document.getElementById('modal-close');
    
    // Help details mapping
    const helpDetails = {
        'inmo': {
            title: 'Honorarios Inmobiliarios',
            desc: 'Es la comisión que percibe la inmobiliaria por su intermediación en la compraventa. En CABA la ley sugiere un arancel de hasta el 4% para el comprador y del 3% para el vendedor. En la Provincia de Buenos Aires suele acordarse entre 3% y 4% para el comprador y 3% para el vendedor. Se le suma el IVA (21%) correspondiente.'
        },
        'sellos': {
            title: 'Impuesto de Sellos',
            desc: 'Impuesto local que grava las escrituras públicas. En CABA la tasa es del 1,35% para cada parte (total 2,7%). En Provincia de Buenos Aires es del 1,2% para cada parte (total 2,4%). Cuenta con una exención para el comprador si es "Vivienda Única, Familiar y de Ocupación Permanente" hasta un monto determinado ($226.100.000 ARS en CABA, aprox. USD 155.000). En Provincia de Buenos Aires asumimos una exención similar hasta USD 80.000. Si el valor supera la exención, se tributa sobre el excedente.'
        },
        'escribano': {
            title: 'Honorarios de Escribanía',
            desc: 'Arancel profesional del escribano por el estudio de títulos, redacción de la escritura y coordinación del cierre. El arancel sugerido por ley es del 2% más IVA sobre el valor total. Históricamente, y según el Código Civil y Comercial, lo abona el comprador en su totalidad salvo acuerdo en contrario.'
        },
        'gastos_pre': {
            title: 'Gastos Pre-Escriturarios',
            desc: 'Incluyen los costos de solicitud de certificados registrales obligatorios (certificado de dominio, de inhibiciones) y liberación de deudas impositivas de la propiedad (ABL, patentes, etc.). Le corresponde abonarlos al vendedor para entregar la propiedad libre de gravámenes.'
        },
        'gastos_post': {
            title: 'Gastos Post-Escriturarios',
            desc: 'Corresponden a las tasas del Registro de la Propiedad Inmueble para inscribir la nueva escritura a nombre del comprador, aportes notariales de ley y tasa de inscripción. Los abona el comprador.'
        },
        'sellos_hipo': {
            title: 'Impuesto de Sellos sobre Hipoteca',
            desc: 'Impuesto específico aplicable a la constitución del crédito hipotecario. Se calcula sobre el monto financiado y la alícuota general es del 1% en CABA y 1,2% en Provincia de Buenos Aires. Lo abona enteramente el comprador (tomador del crédito).'
        },
        'escribano_hipo': {
            title: 'Escritura de Hipoteca',
            desc: 'Honorarios del escribano designado por el banco para redactar y formalizar la hipoteca de garantía sobre el inmueble. Se estima en un 0,5% + IVA del valor prestado. Lo paga el comprador.'
        },
        'iti_ganancias': {
            title: 'Impuesto a las Ganancias / ITI',
            desc: 'Corresponde al vendedor. Si el inmueble fue adquirido antes del 1/1/2018, abona el ITI (Impuesto a la Transferencia de Inmuebles) del 1,5% sobre el valor total. Si es su vivienda única y reinvierte en otra, puede gestionar el certificado de no retención. Si fue adquirido después del 1/1/2018, paga el Impuesto a las Ganancias Cedular (15% sobre la utilidad neta ajustada en dólares). Si vende su vivienda única para vivir, queda exento.'
        }
    };

    // Chart variable
    let doughnutChart = null;

    // Initialize Page Theme from LocalStorage or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);

    // Sync input box and sliders
    function updatePropertyValueDisplay() {
        const value = parseFloat(propValueInput.value) || parseFloat(propValueSlider.value) || 0;
        if (propValueDisplay) {
            propValueDisplay.innerText = formatUSD(value);
        }
    }

    function syncInputs(source, target) {
        target.value = source.value;
        updatePropertyValueDisplay();
        calculateCosts();
    }

    propValueInput.addEventListener('input', () => syncInputs(propValueInput, propValueSlider));
    propValueSlider.addEventListener('input', () => syncInputs(propValueSlider, propValueInput));
    
    financePctInput.addEventListener('input', () => syncInputs(financePctInput, financePctSlider));
    financePctSlider.addEventListener('input', () => syncInputs(financePctSlider, financePctInput));

    // Dynamic Display Sections depending on toggles
    mortgageCheck.addEventListener('change', function() {
        if(this.checked) {
            mortgageSection.classList.add('show');
        } else {
            mortgageSection.classList.remove('show');
        }
        calculateCosts();
    });

    roleBuyer.addEventListener('click', () => setRole('comprador'));
    roleSeller.addEventListener('click', () => setRole('vendedor'));
    roleBoth.addEventListener('click', () => setRole('ambos'));

    function setRole(role) {
        roleBuyer.classList.remove('active');
        roleSeller.classList.remove('active');
        roleBoth.classList.remove('active');

        if(role === 'comprador') {
            roleBuyer.classList.add('active');
            sellerTaxSection.classList.remove('show');
        } else if(role === 'vendedor') {
            roleSeller.classList.add('active');
            sellerTaxSection.classList.add('show');
        } else {
            roleBoth.classList.add('active');
            sellerTaxSection.classList.add('show'); // show for seller part
        }
        calculateCosts();
    }

    locationCaba.addEventListener('click', () => setLocation('caba'));
    locationPba.addEventListener('click', () => setLocation('pba'));

    function setLocation(loc) {
        locationCaba.classList.remove('active');
        locationPba.classList.remove('active');

        if(loc === 'caba') {
            locationCaba.classList.add('active');
        } else {
            locationPba.classList.add('active');
        }
        calculateCosts();
    }

    taxTypeIti.addEventListener('change', () => {
        purchasePriceSection.classList.remove('show');
        calculateCosts();
    });

    taxTypeGanancias.addEventListener('change', () => {
        purchasePriceSection.classList.add('show');
        calculateCosts();
    });

    purchaseValueInput.addEventListener('input', calculateCosts);
    soleDwellingCheck.addEventListener('change', calculateCosts);

    // Theme Switch
    themeToggle.addEventListener('click', function() {
        let theme = document.documentElement.getAttribute('data-theme');
        let newTheme = (theme === 'dark') ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        calculateCosts(); // Re-render charts with correct color themes
    });

    function updateThemeIcon(theme) {
        themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Modal Events
    modalClose.addEventListener('click', () => {
        modalOverlay.classList.remove('show');
    });

    modalOverlay.addEventListener('click', (e) => {
        if(e.target === modalOverlay) {
            modalOverlay.classList.remove('show');
        }
    });

    window.openHelpModal = function(key) {
        const data = helpDetails[key];
        if (data) {
            modalTitle.innerText = data.title;
            modalText.innerHTML = `<p>${data.desc}</p>`;
            modalOverlay.classList.add('show');
        }
    };

    // Printing
    printBtn.addEventListener('click', () => {
        window.print();
    });

    // Core Calculation Logic
    function calculateCosts() {
        const valProp = parseFloat(propValueInput.value) || 0;
        const loc = locationCaba.classList.contains('active') ? 'caba' : 'pba';
        let role = 'comprador';
        if (roleSeller.classList.contains('active')) role = 'vendedor';
        if (roleBoth.classList.contains('active')) role = 'ambos';

        const isViviendaUnica = soleDwellingCheck.checked;
        const isHipotecario = mortgageCheck.checked;
        const pctFinanciacion = parseFloat(financePctInput.value) || 80;
        
        const isGanancias = taxTypeGanancias.checked && role !== 'comprador';
        const valCompraOrig = parseFloat(purchaseValueInput.value) || 0;

        // 1. Calculations - COMPRADOR (Buyer)
        let compInmo = valProp * 0.04;
        let compInmoIva = compInmo * 0.21;
        let compInmoTotal = compInmo + compInmoIva;

        let compSellos = 0;
        if (loc === 'caba') {
            // CABA stamp tax: 1.35% per party. Exemption for vivienda única up to $226.1M (~USD 155.000). Paid on the excess
            const cabaExemptLimit = 155000;
            if (isViviendaUnica) {
                if (valProp > cabaExemptLimit) {
                    compSellos = (valProp - cabaExemptLimit) * 0.0135;
                } else {
                    compSellos = 0;
                }
            } else {
                compSellos = valProp * 0.0135;
            }
        } else {
            // PBA stamp tax: 1.2% per party. Exemption assumed up to USD 80.000 for sole dwelling
            const pbaExemptLimit = 80000;
            if (isViviendaUnica) {
                if (valProp > pbaExemptLimit) {
                    compSellos = (valProp - pbaExemptLimit) * 0.012;
                } else {
                    compSellos = 0;
                }
            } else {
                compSellos = valProp * 0.012;
            }
        }

        let compEscribano = valProp * 0.02;
        let compEscribanoIva = compEscribano * 0.21;
        let compEscribanoTotal = compEscribano + compEscribanoIva;

        let compGastosPost = loc === 'caba' ? valProp * 0.0075 : valProp * 0.0125;

        // Hipoteca
        let compSelloHipo = 0;
        let compEscribanoHipoTotal = 0;
        let montoPrestamo = 0;

        if (isHipotecario) {
            montoPrestamo = valProp * (pctFinanciacion / 100);
            if (loc === 'caba') {
                compSelloHipo = montoPrestamo * 0.01; // 1% CABA
            } else {
                compSelloHipo = montoPrestamo * 0.012; // 1.2% PBA
            }
            let compEscribanoHipo = montoPrestamo * 0.005; // 0.5% arancel
            let compEscribanoHipoIva = compEscribanoHipo * 0.21;
            compEscribanoHipoTotal = compEscribanoHipo + compEscribanoHipoIva;
        }

        let totalComprador = compInmoTotal + compSellos + compEscribanoTotal + compGastosPost + compSelloHipo + compEscribanoHipoTotal;

        // 2. Calculations - VENDEDOR (Seller)
        let vendInmo = valProp * 0.03;
        let vendInmoIva = vendInmo * 0.21;
        let vendInmoTotal = vendInmo + vendInmoIva;

        let vendSellos = 0;
        if (loc === 'caba') {
            vendSellos = valProp * 0.0135; // Seller usually pays their 1.35% regardless of buyer exemption
        } else {
            vendSellos = valProp * 0.012; // 1.2% in PBA
        }

        let vendGastosPre = 0;
        if (loc === 'caba') {
            vendGastosPre = valProp * 0.0075;
        } else {
            // Provincia adds Agrimensora state parcel cost (mandatory)
            vendGastosPre = (valProp * 0.0125) + 400; // 1.25% + USD 400
        }

        let vendTax = 0;
        if (isViviendaUnica) {
            // Exempt from ITI / Ganancias if selling sole dwelling for replacement
            vendTax = 0;
        } else {
            if (isGanancias) {
                // Ganancias: 15% on utility
                const util = valProp - valCompraOrig;
                vendTax = util > 0 ? util * 0.15 : 0;
            } else {
                // ITI: 1.5% of total value
                vendTax = valProp * 0.015;
            }
        }

        let totalVendedor = vendInmoTotal + vendSellos + vendGastosPre + vendTax;

        // 3. Render Outputs
        if (role === 'comprador') {
            singleResultBox.style.display = 'block';
            comparativeResultBox.style.display = 'none';
            
            resultTotalLabel.innerText = 'Total Adicional Comprador';
            resultTotalValue.innerText = formatUSD(totalComprador);
            
            const pct = (totalComprador / valProp) * 100;
            resultPctDisplay.innerText = `+${pct.toFixed(2)}% del valor de propiedad`;

            renderCostBreakdown([
                { key: 'inmo', label: 'Inmobiliaria (4% + IVA)', val: compInmoTotal },
                { key: 'sellos', label: 'Impuesto de Sellos', val: compSellos },
                { key: 'escribano', label: 'Honorarios Escribanía (2% + IVA)', val: compEscribanoTotal },
                { key: 'gastos_post', label: 'Tasas de Inscripción y Aportes', val: compGastosPost },
                { key: 'sellos_hipo', label: 'Sellos Hipotecarios', val: compSelloHipo, show: isHipotecario },
                { key: 'escribano_hipo', label: 'Escribano Hipoteca (0.5% + IVA)', val: compEscribanoHipoTotal, show: isHipotecario }
            ]);

            renderChart(
                ['Inmobiliaria', 'Imp. Sellos', 'Escribanía', 'Inscripción y Aportes', 'Cargos de Crédito'],
                [
                    compInmoTotal,
                    compSellos,
                    compEscribanoTotal,
                    compGastosPost,
                    (compSelloHipo + compEscribanoHipoTotal)
                ]
            );

        } else if (role === 'vendedor') {
            singleResultBox.style.display = 'block';
            comparativeResultBox.style.display = 'none';

            resultTotalLabel.innerText = 'Total Adicional Vendedor';
            resultTotalValue.innerText = formatUSD(totalVendedor);
            
            const pct = (totalVendedor / valProp) * 100;
            resultPctDisplay.innerText = `-${pct.toFixed(2)}% del valor de propiedad`;

            let taxLabel = isGanancias ? 'Ganancias Cedular (15% sobre utilidad)' : 'ITI (1.5% de Venta)';
            if (isViviendaUnica) taxLabel = 'ITI / Ganancias (Exento)';

            renderCostBreakdown([
                { key: 'inmo', label: 'Inmobiliaria (3% + IVA)', val: vendInmoTotal },
                { key: 'sellos', label: 'Impuesto de Sellos', val: vendSellos },
                { key: 'gastos_pre', label: loc === 'caba' ? 'Gastos Pre-Escritura' : 'Gastos Pre-Escritura + Mensura', val: vendGastosPre },
                { key: 'iti_ganancias', label: taxLabel, val: vendTax }
            ]);

            renderChart(
                ['Inmobiliaria', 'Imp. Sellos', 'Gastos Pre-Escritura', 'Impuestos (ITI/Ganancias)'],
                [
                    vendInmoTotal,
                    vendSellos,
                    vendGastosPre,
                    vendTax
                ]
            );

        } else { // 'ambos' - Side by side COMPARATIVE
            singleResultBox.style.display = 'none';
            comparativeResultBox.style.display = 'grid';

            compBuyerValue.innerText = formatUSD(totalComprador);
            compSellerValue.innerText = formatUSD(totalVendedor);

            let taxLabel = isGanancias ? 'Ganancias Cedular' : 'ITI (1.5%)';
            if (isViviendaUnica) taxLabel = 'Impuestos Vendedor (Exento)';

            renderCostBreakdown([
                { key: 'inmo', label: 'Comisión Inmobiliaria', val: compInmoTotal + vendInmoTotal, extraText: `(C: ${formatUSD(compInmoTotal)} | V: ${formatUSD(vendInmoTotal)})` },
                { key: 'sellos', label: 'Impuesto de Sellos Total', val: compSellos + vendSellos, extraText: `(C: ${formatUSD(compSellos)} | V: ${formatUSD(vendSellos)})` },
                { key: 'escribano', label: 'Honorarios Escribanía (Comprador)', val: compEscribanoTotal },
                { key: 'gastos_pre', label: 'Gastos Pre-Escritura (Vendedor)', val: vendGastosPre },
                { key: 'gastos_post', label: 'Gastos Post-Escritura (Comprador)', val: compGastosPost },
                { key: 'sellos_hipo', label: 'Cargos Hipotecarios (Comprador)', val: compSelloHipo + compEscribanoHipoTotal, show: isHipotecario },
                { key: 'iti_ganancias', label: taxLabel, val: vendTax }
            ]);

            renderChart(
                ['Comprador (Total)', 'Vendedor (Total)'],
                [totalComprador, totalVendedor],
                'bar' // Use bar chart for comparison
            );
        }
    }

    function formatUSD(amount) {
        return 'u$s ' + amount.toLocaleString('es-AR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        });
    }

    function renderCostBreakdown(items) {
        costItemsList.innerHTML = '';
        items.forEach(item => {
            if (item.show === false) return; // skip hidden conditional rows
            
            const li = document.createElement('div');
            li.className = 'breakdown-item';
            
            const extra = item.extraText ? ` <span style="font-size: 11px; color: var(--text-muted);">${item.extraText}</span>` : '';
            
            li.innerHTML = `
                <div class="item-label-group">
                    <i class="far fa-question-circle item-help-icon" onclick="openHelpModal('${item.key}')"></i>
                    <span class="item-label">${item.label}${extra}</span>
                </div>
                <span class="item-value">${formatUSD(item.val)}</span>
            `;
            costItemsList.appendChild(li);
        });
    }

    function renderChart(labels, data, chartType = 'doughnut') {
        const ctx = document.getElementById('costsChart').getContext('2d');
        
        // Destruct previous chart instance if exists
        if (doughnutChart) {
            doughnutChart.destroy();
        }

        // Handle dark theme styling
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const labelColor = isDark ? '#94a3b8' : '#64748b';
        const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

        // LLAVE design color palette
        const palette = [
            '#0060B0', // Blue Primary
            '#D82B27', // Red Accent
            '#0d6efd', // Blue light
            '#ffc107', // Gold yellow
            '#198754', // Green success
            '#6f42c1'  // Purple
        ];

        // If comparison bar chart
        if (chartType === 'bar') {
            doughnutChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Gasto Total en USD',
                        data: data,
                        backgroundColor: ['#0060B0', '#D82B27'],
                        borderRadius: 8,
                        maxBarThickness: 40
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return ' ' + formatUSD(context.parsed.y);
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            grid: {
                                color: gridColor
                            },
                            ticks: {
                                color: labelColor,
                                callback: function(value) {
                                    return 'u$s ' + value/1000 + 'k';
                                }
                            }
                        },
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                color: labelColor,
                                font: {
                                    family: 'Outfit',
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            });
        } else {
            // Filter zero values to keep the doughnut chart clean
            const filteredLabels = [];
            const filteredData = [];
            const filteredColors = [];

            data.forEach((val, idx) => {
                if (val > 0) {
                    filteredLabels.push(labels[idx]);
                    filteredData.push(val);
                    filteredColors.push(palette[idx % palette.length]);
                }
            });

            doughnutChart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: filteredLabels,
                    datasets: [{
                        data: filteredData,
                        backgroundColor: filteredColors,
                        borderWidth: isDark ? 2 : 1,
                        borderColor: isDark ? '#0f172a' : '#ffffff',
                        hoverOffset: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: labelColor,
                                font: {
                                    family: 'Plus Jakarta Sans',
                                    size: 11
                                },
                                boxWidth: 12,
                                padding: 12
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const value = context.raw;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return ` ${context.label}: ${formatUSD(value)} (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // Accordion Logic
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');
    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const parent = this.parentElement;
            const isActive = parent.classList.contains('active');
            
            // Close all items
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Toggle clicked item
            if (!isActive) {
                parent.classList.add('active');
            }
        });
    });

    // Run Initial Calculations
    updatePropertyValueDisplay();
    calculateCosts();
});

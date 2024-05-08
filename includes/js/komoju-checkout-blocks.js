const { useEffect, useCallback, useRef, createElement } = window.wp.element;
const { useSelect, useDispatch } = window.wp.data;
const { CHECKOUT_STORE_KEY, VALIDATION_STORE_KEY } = window.wc.wcBlocksData;
const { registerCheckoutBlock, ValidatedTextInput } = window.wc.blocksCheckout;

function registerPaymentMethod(paymentMethod) {
    let name = `${paymentMethod.id}`
    const settings = window.wc.wcSettings.getSetting(`${name}_data`, {});

    const komojuField = createElement('komoju-fields', {
        'token': '',
        'name': 'komoju_payment_token',
        'komoju-api': settings.komojuApi,
        'publishable-key': settings.publishableKey,
        'session': settings.session,
        'payment-type': settings.paymentType,
        style: { display: 'none' },
    });

    const label = createElement('div', {
        style: { display: 'block', alignItems: 'center', justifyContent: 'center' }
    },
        window.wp.htmlEntities.decodeEntities(settings.title || window.wp.i18n.__('NULL GATEWAY', 'test_komoju_gateway')),
        createElement('img', {
            src: settings.icon,
            alt: settings.title || 'Payment Method Icon',
            style: { display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }
        }),
        komojuField,
        // createElement('button', {
        //     type: 'submit',
        //     style: { display: 'flex', width: '300px', height: '50px', alignItems: 'center', justifyContent: 'center' }
        // })
    );

    const MyComponent = ({ activePaymentMethod, emitResponse, eventRegistration, onSubmit }) => {
        console.log('Active Payment Method: ', activePaymentMethod)

        useEffect(() => {
            const handleKeyDown = async (event) => {
                if (event.key === 'Enter') {
                    if (paymentMethod.id != activePaymentMethod) return;

                    let queryKomojuField = document.querySelector(`komoju-fields[payment-type='${paymentMethod.paymentType}']`);
                    if (queryKomojuField && typeof queryKomojuField.submit === 'function') {
                        console.log('Enter key pressed, submitting...');

                        console.log(`SUBMIT THE FIELD`)
                        var submitResult = await queryKomojuField.broker.send({ type: 'submit' });

                        console.log(`${JSON.stringify(submitResult)}`)
                        // Now we add an input to the form with the token and submit it.
                        const inputName = 'komoju_payment_token'
                        let input = document.querySelector(`input[name="${inputName}"]`);
                        if (!input) {
                            input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = inputName;
                            queryKomojuField.formSubmitHandler.form.append(input);
                        }
                        input.value = submitResult.token.id;
                        queryKomojuField.token = submitResult.token;

                        queryKomojuField.formSubmitHandler.form.addEventListener("submit", (event) => {
                            console.log("submit event##########")
                        });
                        // queryKomojuField.submitParentForm();
                    }
                }
            };

            document.addEventListener('keydown', handleKeyDown);

            const komojuField = document.querySelector(`komoju-fields[payment-type='${paymentMethod.paymentType}']`);
            komojuField.style.display = 'block';

            return () => {
                komojuField.style.display = 'none';
            };
        }, [activePaymentMethod]);
    };

    const Block_Gateway = {
        name: name,
        label: label,
        savedTokenComponent: komojuField,
        content: createElement(MyComponent, null),
        edit: createElement(MyComponent, null),
        canMakePayment: () => true,
        ariaLabel: settings.title || 'Payment Method',
        supports: {
            features: (settings.supports || ['products']).concat('[tokenization]'),
        }
    };

    window.wc.wcBlocksRegistry.registerPaymentMethod(Block_Gateway);
}

const paymentMethodData = window.wc.wcSettings.getSetting('paymentMethodData', {});
console.log(`Payment Method Data: ${JSON.stringify(paymentMethodData)}`);

Object.values(paymentMethodData).forEach((value) => {
    registerPaymentMethod(value);
});
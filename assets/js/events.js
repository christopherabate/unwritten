 /**
 * DOM event bridge.
 *
 * Converts DOM events into CustomEvents based on `data-event`
 * and `data-on` attributes.
 *
 * Event declarations support:
 *
 * The originating DOM element is exposed as `element` and
 * the original DOM event as `trigger`.
 *
 * An event can pause the chain by assigning a Promise to
 * `event.detail.done`.
 *
 * @example
 * <button data-event="action">...</button>
 *
 * @example
 * <button data-event="action:value">...</button>
 *
 * @example
 * <button data-event="action:key=value">...</button>
 *
 * @example
 * <button data-event="action:key=value,other=value">
 *   ...
 * </button>
 *
 * @example
 * <button data-event="action:value|action:key=value">
 *   ...
 * </button>
 */

[
  'click',
  'change',
  'input',
  'submit'
].forEach(type => {

  document.addEventListener(type, async event => {

    /**
     * Ignore non-element targets.
     */
    if (!(event.target instanceof Element)) return;

    /**
     * Submit events originate from the form, so declarations
     * can be located anywhere inside it. Other events resolve
     * to the closest matching element.
     */
    const elements = type === 'submit'
      ? event.target.querySelectorAll(`[data-event][data-on~="${type}"]`)
      : [event.target.closest(`[data-event]:not([data-on]), [data-event][data-on~="${type}"]`)];

    for (const element of elements) {

      if (!element) continue;

      /**
       * Parse and dispatch each event declaration.
       */
      for (const token of element.dataset.event.split('|')) {

        const [name, parameters] = token.trim().split(/:(.*)/s);

        if (!name.trim()) throw new SyntaxError(`Invalid event: "${token}"`);

        const data = parameters
          ? parameters.includes('=')
            ? Object.fromEntries(
                parameters.split(',').map(parameter => {

                  const [key, ...values] = parameter.split('=');

                  if (!key.trim()) throw new SyntaxError(`Invalid parameter: "${parameter}"`);

                  return [
                    key.trim(),
                    values.join('=').trim()
                  ];

                })
              )
            : {
                value: parameters.trim()
              }
          : {};

        /**
         * Dispatch the custom event.
         *
         * @example
         * document.addEventListener('scene', event => {
         *   console.log(event.detail.value);
         * });
         */
        const detail = {
          ...data,
          element,
          trigger: event
        };

        document.dispatchEvent(
          new CustomEvent(name.trim(), { detail })
        );

        /**
         * Wait for the event to finish before continuing.
         */
        if (detail.done) await detail.done;
      }
    }
  });
});

const INTERNAL = ['value', 'element', 'trigger', 'done'];
import type { Attachment } from 'svelte/attachments';

/* Text-entry controls the Return key can move between */
const FIELDS = 'input:not([type=hidden]):not([type=submit]):not([type=button]), textarea';

/*
 * Makes Return on a phone keyboard behave like Tab instead of submitting the form.
 * Moves focus to the next visible field, or dismisses the keyboard on the last one.
 * Textareas keep Return for new lines, and the form still submits from its submit button.
 *
 * Usage: <form {@attach enterToNext}>
 */
export const enterToNext: Attachment<HTMLFormElement> = (form) => {
	const onkeydown = (event: KeyboardEvent) => {
		const target = event.target;

		// Mid IME composition, Return confirms the composed text
		if (event.key !== 'Enter' || event.isComposing) return;
		if (!(target instanceof HTMLInputElement)) return;
		if (['submit', 'button', 'checkbox', 'radio'].includes(target.type)) return;

		event.preventDefault();

		// Skip fields in hidden tabs or otherwise not rendered
		const fields = [...form.querySelectorAll<HTMLElement>(FIELDS)].filter(
			(field) => field.getClientRects().length > 0 && !field.hasAttribute('disabled')
		);
		const next = fields[fields.indexOf(target) + 1];

		if (next) {
			next.focus();
		} else {
			target.blur();
		}
	};

	form.addEventListener('keydown', onkeydown);
	return () => form.removeEventListener('keydown', onkeydown);
};

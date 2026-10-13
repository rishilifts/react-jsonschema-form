import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { render, screen } from '@testing-library/react';

import NativeSelectWidget from '../src/NativeSelectWidget/NativeSelectWidget.tsx';
import Form from './WrappedForm.tsx';

describe('NativeSelectWidget aria props', () => {
  test.each([
    ['alt-date', false],
    ['alt-date', true],
    ['alt-datetime', false],
    ['alt-datetime', true],
  ] as const)('names and describes %s parts when hideLabel is %s', (widget, hideLabel) => {
    const schema: RJSFSchema = {
      type: 'object',
      properties: {
        when: {
          type: 'string',
          format: widget === 'alt-date' ? 'date' : 'date-time',
          title: 'When',
          description: 'Pick a day',
        },
      },
    };
    const uiSchema: UiSchema = {
      when: {
        'ui:widget': widget,
        'ui:help': 'Any day will do',
        'ui:label': !hideLabel,
        'ui:options': { yearsRange: [2020, 2024] },
      },
    };
    const { container } = render(
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        widgets={{ SelectWidget: NativeSelectWidget }}
        extraErrors={{ when: { __errors: ['Too early'] } }}
      />,
    );
    const parts =
      widget === 'alt-date' ? ['year', 'month', 'day'] : ['year', 'month', 'day', 'hour', 'minute', 'second'];
    for (const part of parts) {
      const select = screen.getByRole('combobox', { name: `When, ${part}` });
      expect(select).toHaveAttribute('aria-describedby', 'root_when__error root_when__description root_when__help');
      const ids = select.getAttribute('aria-describedby')?.split(' ') ?? [];
      expect(ids).not.toContain(`root_when_${part}__description`);
      expect(select).toHaveAccessibleDescription(expect.stringContaining('Any day will do'));
      expect(select).toHaveAccessibleDescription(expect.stringContaining('Too early'));
      if (!hideLabel) {
        expect(select).toHaveAccessibleDescription(expect.stringContaining('Pick a day'));
      }
      expect(container.querySelector(`#root_when_${part}__description`)).not.toBeInTheDocument();
    }
  });
});

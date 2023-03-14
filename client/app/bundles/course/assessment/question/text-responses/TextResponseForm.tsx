import { useRef, useState } from 'react';
import { Controller } from 'react-hook-form';
import {
  TextResponseData,
  TextResponseFormData,
} from 'types/course/assessment/question/text-responses';

import Section from 'lib/components/core/layouts/Section';
import FormCheckboxField from 'lib/components/form/fields/CheckboxField';
import Form, { FormEmitter } from 'lib/components/form/Form';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import CommonFieldsInQuestionForm from '../components/QuestionFormCommonFields';

import SolutionsManager, { SolutionsManagerRef } from './SolutionsManager';
import { questionSchema, validateSolutions } from './validations';

export interface TextResponseFormProps<T extends 'new' | 'edit'> {
  with: TextResponseFormData<T>;
  onSubmit: (data: TextResponseData) => Promise<void>;
}

const TextResponseForm = <T extends 'new' | 'edit'>(
  props: TextResponseFormProps<T>,
): JSX.Element => {
  const { with: data } = props;

  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<FormEmitter>();
  const [isSolutionsDirty, setIsSolutionsDirty] = useState(false);

  const solutionsRef = useRef<SolutionsManagerRef>(null);

  const prepareSolutions = async (): Promise<
    TextResponseData<T>['solutions'] | undefined
  > => {
    solutionsRef.current?.resetErrors();
    const solutions = solutionsRef.current?.getSolutions() ?? [];
    const errors = await validateSolutions(solutions);

    if (errors) {
      solutionsRef.current?.setErrors(errors);
      return undefined;
    }

    return solutions;
  };

  const { t } = useTranslation();

  const handleSubmit = async (
    question: TextResponseData['question'],
  ): Promise<void> => {
    const solutions = await prepareSolutions();
    const newData: TextResponseData = {
      questionType: data.questionType,
      question,
      solutions,
    };
    setSubmitting(true);
    props.onSubmit(newData).catch((errors) => {
      setSubmitting(false);
      form?.receiveErrors?.(errors);
    });
  };

  return (
    <Form
      dirty={isSolutionsDirty}
      disabled={submitting}
      emitsVia={setForm}
      headsUp
      initialValues={data.question}
      onSubmit={handleSubmit}
      validates={questionSchema}
    >
      {(control): JSX.Element => (
        <>
          <CommonFieldsInQuestionForm
            availableSkills={data.availableSkills}
            control={control}
            disabled={submitting}
            skillsUrl={data.skillsUrl}
          />

          {data.questionType === 'text_response' && (
            <Section
              sticksToNavbar
              subtitle={t(translations.solutionsHint)}
              title={t(translations.solutions)}
            >
              <Controller
                control={control}
                name="allowAttachment"
                render={({ field, fieldState }): JSX.Element => (
                  <FormCheckboxField
                    disabled={submitting}
                    field={field}
                    fieldState={fieldState}
                    label={t(translations.allowFileUpload)}
                  />
                )}
              />

              <SolutionsManager
                ref={solutionsRef}
                disabled={submitting}
                for={data.solutions ?? []}
                onDirtyChange={setIsSolutionsDirty}
              />
            </Section>
          )}
        </>
      )}
    </Form>
  );
};

export default TextResponseForm;

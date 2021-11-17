# frozen_string_literal: true
module Course::Assessment::Submission::AnswersConcern
  extend ActiveSupport::Concern

  # Scope to obtain the latest answers for each question for Course::Assessment::Submission.
  def latest_answers
    unscope(:order).select('DISTINCT ON (question_id) *').order(:question_id, created_at: :desc)
  end

  # Load the answers belonging to a specific question.
  #
  # Keep this as a scope so the freshest data will be fetched from the database even if the
  # CollectionProxy does not have the freshest data.
  # Do not "optimise" by using `select` on the existing CollectionProxy or MCQ results will break.
  def from_question(question_id)
    where(question_id: question_id)
  end

  def create_new_answers
    questions_to_attempt ||= assessment.questions
    new_answers = questions_to_attempt.not_answered(self).attempt(self)

    new_answers.map do |answer|
      # When there are no existing answers, the first one will be the current_answer.
      if answer.new_record?
        answer.current_answer = true
        answer.save!
      end
    end
  end
end

# frozen_string_literal: true
class Course::Assessment::Submission::Answer::Programming::ProgrammingController < \
  Course::Assessment::Submission::Answer::Programming::Controller
  load_resource :actable, class: Course::Assessment::Answer::Programming.name,
                          singleton: true, through: :answer
  before_action :set_programming_answer

  helper Course::Assessment::Submission::SubmissionsHelper.name.sub(/Helper$/, '')

  def create_programming_files
    authorize! :create_programming_files, @programming_answer

    if update_answer_files_attributes(create_programming_files_params.merge(session_id: session.id))
      render @programming_answer.answer
    else
      render json: { error: 'Incompatible files' }, status: :bad_request
    end
  end

  def destroy_programming_file
    authorize! :destroy_programming_file, @programming_answer

    file_id = delete_programming_file_params[:file_id].to_i
    client_version = delete_programming_file_params[:clientVersion]
    if delete_programming_file(file_id, client_version)
      render json: { answerId: @programming_answer.answer.id, fileId: file_id }
    else
      render json: { errors: @programming_answer.answer.errors }, status: :bad_request
    end
  end

  private

  def create_programming_files_params
    params.require(:answer).permit([files_attributes: [:id, :filename, :content]], :clientVersion)
  end

  def delete_programming_file_params
    params.require(:answer).permit([:id, :file_id, :clientVersion])
  end

  def update_answer_files_attributes(answer_params)
    @programming_answer.create_and_update_files(answer_params)
  end

  def delete_programming_file(file_id, client_version)
    @programming_answer.delete_file(file_id, client_version, session.id)
  end
end

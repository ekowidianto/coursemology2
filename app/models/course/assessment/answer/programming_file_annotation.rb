# frozen_string_literal: true
class Course::Assessment::Answer::ProgrammingFileAnnotation < ActiveRecord::Base
  acts_as_discussion_topic display_globally: true

  belongs_to :file, class_name: Course::Assessment::Answer::ProgrammingFile.name,
                    inverse_of: :annotations

  after_initialize :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    joins { file.answer.answer.submission }.
      where { file.answer.answer.submission.creator_id >> user_id }.
      joins { discussion_topic }.select { discussion_topic.id }
  end)

  def notify(post)
    Course::Assessment::Answer::CommentNotifier.annotation_replied(post.creator, post)
  end

  private

  # Set the course as the same course of the answer.
  def set_course
    self.course ||= file.answer.course if file && file.answer
  end
end

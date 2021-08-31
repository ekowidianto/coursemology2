# frozen_string_literal: true
class Course::GroupsController < Course::ComponentController
  load_and_authorize_resource :group, through: :course, class: Course::Group.name
  add_breadcrumb :index, :course_groups_path

  def index #:nodoc:
    @groups = @groups.ordered_by_name.includes(group_users: { course_user: :course })
  end

  def show #:nodoc:
    @group_users = @group.group_users.includes(:course_user)
    @group_managers, @group_users = @group_users.partition(&:manager?)
  end

  def new #:nodoc:
  end

  def create #:nodoc:
    if @group.save
      redirect_to edit_course_group_path(current_course, @group),
                  success: t('.success', name: @group.name)
    else
      render 'new'
    end
  end

  def edit #:nodoc:
  end

  def update #:nodoc:
    @group.group_users.destroy_all
    if @group.update_attributes(group_params)
      redirect_to course_groups_path(current_course), success: t('.success', name: @group.name)
    else
      render 'edit'
    end
  end

  def destroy #:nodoc
    if @group.destroy
      redirect_to course_groups_path(current_course),
                  success: t('.success', name: @group.name)
    else
      redirect_to course_groups_path, danger: @group.errors.full_messages.to_sentence
    end
  end

  private

  def group_params #:nodoc:
    group_managers_attributes = params[:group][:manager_ids].select{ |item| item != "" }.map{ |item| {course_user_id: item, role: "manager"} }
    group_normals_attributes = params[:group][:normal_ids].select{ |item| item != "" }.map{ |item| {course_user_id: item, role: "normal"} }
    params[:group][:group_users_attributes] = group_managers_attributes + group_normals_attributes
    byebug
    params.require(:group).
      permit(:name, course_user_ids: [],
                    group_users_attributes: [:id, :course_user_id, :role, :_destroy])
  end

  # @return [Course::GroupsComponent]
  # @return [nil] If component is disabled.
  def component
    current_component_host[:course_groups_component]
  end
end

require 'rails_helper'

RSpec.feature 'Course: Achievements' do
  let!(:instance) { create(:instance) }

  with_tenant(:instance) do
    let(:user) { create(:administrator) }
    let(:course) { create(:course) }

    before do
      login_as(user, scope: :user)
    end

    context 'As a Course Manager' do

      scenario 'I can create an achievement' do
        # Fields not yet filled
        visit new_course_achievement_path(course)
        click_button I18n.t('helpers.submit.achievement.create')
        expect(page).to have_button(I18n.t('helpers.submit.achievement.create'))
        expect(page).to have_css('div.has-error')

        achievement = build(:course_achievement, course: course)
        fill_in 'achievement_title', with: achievement.title
        fill_in 'achievement_description', with: achievement.description
        expect do
          click_button I18n.t('helpers.submit.achievement.create')
        end.to change(course.achievements, :count).by(1)
        expect(page).to have_selector('div', text: I18n.t('course.achievements.create.success'))
        expect(current_path).to eq(course_achievements_path(course))
      end

      scenario 'I can delete an achievement' do
        visit new_course_achievement_path(course)
        achievement = create(:course_achievement, course: course)
        achievement_path = course_achievement_path(course, achievement)
        visit course_achievements_path(course)
        expect do
          # Show and delete have the same URL, difference is in the request method
          # find the 2nd link that matches the path [2], this is the delete button
          find_link(nil, href: achievement_path, between: 2..2).click
        end.to change(course.achievements, :count).by(-1)
        expect(page).to have_selector('div',
                                      text: I18n.t('course.achievements.destroy.success'))
      end

      scenario 'I can edit an achievement' do
        achievement = create(:course_achievement, course: course)
        visit edit_course_achievement_path(course, achievement)
        expect(page).to have_field('achievement_title', with: achievement.title)
        expect(page).to have_field('achievement_description', with: achievement.description)
        expect(page).to have_checked_field('achievement_published')

        # Invalid fields
        fill_in 'achievement_title', with: ''
        click_button I18n.t('helpers.submit.achievement.update')
        expect(page).to have_button(I18n.t('helpers.submit.achievement.update'))
        expect(page).to have_css('div.has-error')

        new_title = 'New Title'
        new_description = 'New description'
        fill_in 'achievement_title', with: new_title
        fill_in 'achievement_description', with: new_description
        click_button I18n.t('helpers.submit.achievement.update')
        expect(current_path).to eq course_achievements_path(course)
        expect(page).to have_selector('div', I18n.t('course.achievements.update.success'))
        expect(achievement.reload.title).to eq(new_title)
        expect(achievement.reload.description).to eq(new_description)
      end

      scenario 'I can create an achievement condition' do
        achievement = create(:course_achievement, course: course)
        visit edit_course_achievement_path(course, achievement)
        condition_achievement = create(:course_achievement, course: course)
        expect(page).to have_selector(:link_or_button,
                                      I18n.t('course.condition.achievements.new.header'))
        click_link I18n.t('course.condition.achievements.new.header')
        expect(current_path).
          to eq(new_course_achievement_condition_achievement_path(course, achievement))
        find('#condition_achievement_achievement_id').
          find(:css, "option[value='#{condition_achievement.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_achievement.create')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('tr.condition > td.achievement-condition-content',
                                      text: condition_achievement.title)
      end

      scenario 'I can edit an achievement condition' do
        achievement_to_change_to = create(:course_achievement, course: course)
        achievement_condition, achievement, other_achievement =
          create_achievement_condition
        visit edit_course_achievement_path(course, achievement)
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('tr.condition > td.achievement-condition-content',
                                      text: other_achievement.title)
        condition_edit_path =
          edit_course_achievement_condition_achievement_path(course,
                                                             achievement,
                                                             achievement_condition)
        find_link(nil, href: condition_edit_path).click

        find('#condition_achievement_achievement_id').
          find(:css, "option[value='#{achievement_to_change_to.id}']").
          select_option
        click_button I18n.t('helpers.submit.condition_achievement.update')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('tr.condition > td.achievement-condition-content',
                                      text: achievement_to_change_to.title)
      end

      scenario 'I can delete an achievement condition' do
        achievement_condition, achievement, other_achievement =
          create_achievement_condition
        visit edit_course_achievement_path(course, achievement)
        condition_delete_path =
          course_achievement_condition_achievement_path(course, achievement,
                                                        achievement_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
        end.to change { achievement.conditions.count }.by(-1)
        expect(page).not_to have_selector('tr.condition > td.achievement-condition-content',
                                          text: other_achievement.title)
      end

      scenario 'I can create a level condition' do
        achievement = create(:course_achievement, course: course)
        visit edit_course_achievement_path(course, achievement)
        expect(page).to have_selector(:link_or_button,
                                      I18n.t('course.condition.levels.new.header'))
        click_link I18n.t('course.condition.levels.new.header')
        expect(current_path).to eq(new_course_achievement_condition_level_path(course,
                                                                               achievement))
        fill_in 'minimum_level', with: '10'
        click_button I18n.t('helpers.submit.condition_level.create')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('tr.condition > td.level-condition-content', text: '10')
      end

      scenario 'I can edit a level condition' do
        level_condition, achievement = create_level_condition
        visit edit_course_achievement_path(course, achievement)
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('tr.condition > td.level-condition-content', text: '1')
        condition_edit_path = edit_course_achievement_condition_level_path(course,
                                                                           achievement,
                                                                           level_condition)
        find_link(nil, href: condition_edit_path).click
        fill_in 'minimum_level', with: '13'
        click_button I18n.t('helpers.submit.condition_level.update')
        expect(current_path).to eq edit_course_achievement_path(course, achievement)
        expect(page).to have_selector('tr.condition > td.level-condition-content', text: '13')
      end

      scenario 'I can delete a level condition' do
        level_condition, achievement = create_level_condition
        visit edit_course_achievement_path(course, achievement)
        condition_delete_path = course_achievement_condition_level_path(course,
                                                                        achievement,
                                                                        level_condition)
        expect do
          find_link(nil, href: condition_delete_path).click
        end.to change { achievement.conditions.count }.by(-1)
        expect(page).not_to have_selector('tr.condition > td.level-condition-content', text: '1')
      end

      def create_achievement_condition
        other_achievement = create(:course_achievement, course: course)
        achievement_condition =
          create(:course_condition_achievement,
                 course: course, achievement: other_achievement)
        achievement = create(:course_achievement,
                             course: course,
                             conditions: [achievement_condition])
        [achievement_condition, achievement, other_achievement]
      end

      def create_level_condition
        level_condition = create(:course_condition_level, course: course)
        achievement = create(:course_achievement,
                             course: course,
                             conditions: [level_condition])
        [level_condition, achievement]
      end
    end
  end
end

# Plugin redmine_subcomplete
# Provides wiki macro autocomplete («{{») in all Redmine wiki text areas.
#
# init.rb is executed by Redmine::PluginLoader INSIDE its own to_prepare block,
# so we apply hooks directly here — no nested Rails.configuration.to_prepare needed.

require 'redmine'

Redmine::Plugin.register :redmine_subcomplete do
  name        'Subcomplete'
  author      'Stefan Mischke'
  description 'Autocomplete for Redmine wiki macros — type {{ in any wiki text area to get a dropdown of available macros with descriptions.'
  version     '0.1.0'
  url         'https://github.com/subversive-tools/redmine_subcomplete'
  author_url  'https://github.com/modoq'
end

# Load the hook class — self-registers with Redmine::Hook on load
MacroAutocompleteHook

import sublime
import sublime_plugin

g_counter = 0
settings = sublime.load_settings("io_replay.sublime-settings")

class IoReplayCommand(sublime_plugin.TextCommand):
  def run(self, edit):
    global g_counter
    global settings

    playback_speed = 15

    inserts = settings.get("inserts", [])

    if (g_counter < len(inserts)):
      #self.view.sel().clear()

      insert_list = inserts[g_counter]
      g_counter += 1

      if not isinstance(insert_list, list):
        insert_list = [ insert_list ]

      t = 0

      highlight_lines = []

      for insert in insert_list:
        replace = insert.get("replace", None)
        after = insert.get("after", replace)
        instant = insert.get("instant", False)
        highlight = insert.get("highlight", True)
        insert_strings = insert.get("insert", "")

        if not isinstance(insert_strings, list):
          insert_strings = [ insert_strings ]

        def set_insertion_point(after, replace):
          def clear_and_set_point(after, replace):
            region = self.view.find(after, 0, sublime.LITERAL)
            #self.view.sel().add(region)
            if region:
              self.view.sel().clear()
              if replace:
                self.view.sel().add(sublime.Region(region.begin(), region.end()))
              else:
                self.view.sel().add(sublime.Region(region.end(), region.end()))
                self.view.run_command('insert', {'characters': '\n'})
          return lambda: clear_and_set_point(after, replace)

        sublime.set_timeout(set_insertion_point(after, replace), t)
        t += playback_speed

        def insert_chars_cmd(str_chars):
          return lambda: self.view.run_command('insert', {'characters': str_chars})

        line_count = 0
        for insert_string in insert_strings:
          if highlight:
            highlight_lines.append(insert_string);
          line_count += 1
          if (line_count > 1):
            sublime.set_timeout(insert_chars_cmd('\n'), t)
            t += playback_speed
          if instant:
            sublime.set_timeout(insert_chars_cmd(insert_string), t)
            t += playback_speed
          else:
            for str_char in insert_string:
              sublime.set_timeout(insert_chars_cmd(str_char), t)
              if str_char == '\n':
                line_count += 1
              t += playback_speed

      def highlight_region(lines):
        def really_highlight_region(lines):
          for line in lines:
            if not line == '':
              self.view.run_command('io_replay_highlight', {'line': line})
        return lambda: really_highlight_region(lines)

      sublime.set_timeout(highlight_region(highlight_lines), t)
      t += playback_speed

class IoReplayHighlightCommand(sublime_plugin.TextCommand):
  def run(self, edit, line='~~~'):
    region = self.view.find(line, 0, sublime.LITERAL)
    #line = self.view.full_line(start)
    self.view.sel().add(region)

class IoReplayResetCommand(sublime_plugin.TextCommand):
  def run(self, edit, line='~~~'):
    global g_counter
    g_counter = 0

def plugin_loaded():
    global g_counter
    global settings
    g_counter = 0
    settings = sublime.load_settings("io_replay.sublime-settings")

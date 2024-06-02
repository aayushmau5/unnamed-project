# elixir code to build the browser extension package

defmodule Build do
  def run() do
    builds_dir = create_or_replace_builds_dir()

    ["firefox", "brave", "chrome"]
    |> Enum.each(&(build_for(&1, builds_dir)))

    IO.inspect("Build finished!")
  end

  defp build_for(browser, builds_dir) do
    Path.join([builds_dir, "#{browser}-build"])
    |> create_dir()
    |> copy_build_files()
    |> replace_placeholder(browser)
  end

  def create_or_replace_builds_dir() do
    path = Path.join([File.cwd!(), "builds"])
    if File.exists?(path), do: File.rm_rf!(path)
    File.mkdir!(path)

    path
  end

  defp create_dir(dir) do
    File.mkdir!(dir)
    dir
  end

  defp copy_build_files(dir) do
    Path.join([File.cwd!(), "extension"])
    |> File.cp_r!(dir)

    dir
  end

  defp replace_placeholder(dir, browser) do
    background_file_path = Path.join([dir, "scripts/background.js"])

    new_content =
      File.read!(background_file_path)
      |> String.replace("<browser_placeholder>", browser)

    File.write!(background_file_path, new_content)

    dir
  end
end

Build.run()

# elixir code to build the browser extension package

defmodule Build do
  def run() do
    ["firefox", "brave", "chrome"]
    |> Enum.each(&build_for/1)
  end

  defp build_for(browser) do
    Path.join([File.cwd!(), "#{browser}-build"])
    |> create_temp_dir()
    |> copy_build_files()
    |> replace_placeholder(browser)
    |> zip_dir()
    |> delete_temp_dir()
  end

  defp create_temp_dir(dir) do
    File.mkdir!(dir)
    dir
  end

  defp delete_temp_dir(path) do
    File.rm_rf!(path)
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

  defp zip_dir(dir) do
    {_, 0} = System.cmd("zip", ["-r", "#{dir}.zip", dir])
    dir
  end
end

Build.run()

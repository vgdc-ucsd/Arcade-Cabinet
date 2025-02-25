import sys
import subprocess
import urllib.parse

def main():
    if len(sys.argv) < 2:
        print("No command provided")
        return

    # Extract and decode the argument (remove the scheme and decode URL encoding)
    raw_cmd = sys.argv[1]
    if raw_cmd.startswith("vgdcgame:"):
        raw_cmd = raw_cmd[9:]

    decoded_cmd = urllib.parse.unquote(raw_cmd)

    # Run the process
    subprocess.run(decoded_cmd, shell=True)

if __name__ == "__main__":
    main()
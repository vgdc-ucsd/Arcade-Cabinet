#include "windows.h"
#include <string>

std::string unescape(std::string str)
{
    size_t pos;
    while ((pos = str.find("%")) != std::string::npos) {
        if (pos <= str.length() - 3) {
            char replace[2] = { (char)(std::stoi("0x" + str.substr(pos + 1, 2), NULL, 16)), '\0' };
            str.replace(pos, 3, replace);
        }
    }
    return str.substr(5);
}

int CALLBACK WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR pCmdLine, int nCmdShow)
{
    STARTUPINFO si;
    PROCESS_INFORMATION pi;

    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    ZeroMemory(&pi, sizeof(pi));
    std::string s = unescape(pCmdLine);
    std::wstring ws;
    ws.assign(s.begin(), s.end());
    CreateProcess(NULL, (wchar_t *)ws.c_str(), NULL, NULL, FALSE, 0, NULL, NULL, &si, &pi);
    WaitForSingleObject(pi.hProcess, INFINITE);

    // Close process and thread handles. 
    CloseHandle(pi.hProcess);
    CloseHandle(pi.hThread);
}
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

int main(int argc, char* argv[])
{
    system(unescape(argv[1]).c_str());
	return 0;
}
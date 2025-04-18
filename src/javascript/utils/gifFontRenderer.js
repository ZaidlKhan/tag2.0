export const gifFontMap = {
    'a': '/fonts/gifs/a.gif',
    'b': '/fonts/gifs/b.gif',
    'c': '/fonts/gifs/c.gif',
    'd': '/fonts/gifs/d.gif',
    'e': '/fonts/gifs/e.gif',
    'f': '/fonts/gifs/f.gif',
    'g': '/fonts/gifs/g.gif',
    'h': '/fonts/gifs/h.gif',
    'i': '/fonts/gifs/i.gif',
    'j': '/fonts/gifs/j.gif',
    'k': '/fonts/gifs/k.gif',
    'l': '/fonts/gifs/l.gif',
    'm': '/fonts/gifs/m.gif',
    'n': '/fonts/gifs/n.gif',
    'o': '/fonts/gifs/o.gif',
    'p': '/fonts/gifs/p.gif',
    'q': '/fonts/gifs/q.gif',
    'r': '/fonts/gifs/r.gif',
    's': '/fonts/gifs/s.gif',
    't': '/fonts/gifs/t.gif',
    'u': '/fonts/gifs/u.gif',
    'v': '/fonts/gifs/v.gif',
    'w': '/fonts/gifs/w.gif',
    'x': '/fonts/gifs/x.gif',
    'y': '/fonts/gifs/y.gif',
    'z': '/fonts/gifs/z.gif',
};

export function getGifForChar(char) {
    const lowerChar = char.toLowerCase();
    return gifFontMap[lowerChar] || gifFontMap[' '];
}
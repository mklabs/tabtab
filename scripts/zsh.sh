###-begin-{pkgname}-completion-###
if type compdef &>/dev/null; then
  _{pkgname}_completion() {
    local si=$IFS
    compadd -- $(COMP_CWORD=$((CURRENT-1)) \
                 COMP_LINE=$BUFFER \
                 COMP_POINT=0 \
                 {completer} completion -- "${words[@]}" \
                 2>/dev/null)
    IFS=$si
  }
  compdef _{pkgname}_completion {pkgname}
elif type compctl &>/dev/null; then
  _{pkgname}_completion () {
    local cword line point words si
    read -Ac words
    read -cn cword
    let cword-=1
    read -l line
    read -ln point
    si="$IFS"
    IFS=$'\n' reply=($(COMP_CWORD="$cword" \
                       COMP_LINE="$line" \
                       COMP_POINT="$point" \
                       {completer} completion -- "${words[@]}" \
                       2>/dev/null)) || return $?
    IFS="$si"
  }
  compctl -K _{pkgname}_completion {pkgname}
fi
###-end-{pkgname}-completion-###

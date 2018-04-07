#!/bin/sh
# this super hack will sync the explorer within the specified block height range
forcesync() {
  blockcount=$1
  echo "╒══════════════════<<"
  echo "| height : $blockcount"
  blockhash=`curl -s https://explorer.sanity.mn/api/getblockhash?height=$blockcount`
  echo "| ଓ hash : $blockhash"
  curl -s https://explorer.sanity.mn/block/$blockhash > /dev/null
  echo "╘═══════════════════════════════>>"
}

main() {
  if [ $currentblockcount -ne $endingblockcount ]; then
    forcesync $currentblockcount
    currentblockcount=$((currentblockcount + 1))
  else exit;  fi
  main
}

startingblockcount=1000
endingblockcount=1010
echo "Syncing..."
currentblockcount=$startingblockcount
main

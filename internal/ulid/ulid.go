// Package ulid generates cryptographically random ULIDs.
package ulid

import (
	"crypto/rand"
	"fmt"
	"time"
)

const ulidLen = 26

// Crockford base32 alphabet (no padding).
const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"

// Make generates a new ULID as a 26-character Crockford base32 string.
// The first 12 characters encode the millisecond timestamp; the remaining
// 14 characters encode 80 bits of cryptographic randomness.
func Make() (string, error) {
	var bits [128]byte

	// 48-bit millisecond timestamp in the first 48 bits
	ms := uint64(time.Now().UnixMilli())
	for i := 5; i >= 0; i-- {
		bits[5-i] = byte(ms >> (uint(i) * 8))
	}

	// 80-bit random component in the remaining 80 bits
	var randBuf [10]byte
	if _, err := rand.Read(randBuf[:]); err != nil {
		return "", fmt.Errorf("ulid: random: %w", err)
	}
	copy(bits[6:], randBuf[:])

	// Encode 128 bits as 26 Crockford base32 characters (5 bits each)
	var out [ulidLen]byte
	for i := 0; i < ulidLen; i++ {
		// Collect 5 bits starting at bit position i*5
		bitPos := i * 5
		byteIdx := bitPos / 8
		bitOffset := bitPos % 8

		var val byte
		if byteIdx < 16 {
			val = bits[byteIdx] >> uint(3-bitOffset) & 0x1f
		}
		if bitOffset > 3 && byteIdx+1 < 16 {
			val |= bits[byteIdx+1] << uint(8-bitOffset) & 0x1f
		}

		// Last character only uses 3 bits (128 total = 26*5 - 2)
		if i == ulidLen-1 {
			val &= 0x07
		}

		out[i] = alphabet[val]
	}

	return string(out[:]), nil
}

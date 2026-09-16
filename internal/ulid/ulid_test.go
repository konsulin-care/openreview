package ulid

import (
	"testing"
	"time"
)

func TestMake_Length(t *testing.T) {
	id, err := Make()
	if err != nil {
		t.Fatalf("Make() error = %v", err)
	}
	if len(id) != 26 {
		t.Errorf("Make() returned length %d, want 26", len(id))
	}
}

func TestMake_Unique(t *testing.T) {
	seen := make(map[string]bool)
	for i := 0; i < 1000; i++ {
		id, err := Make()
		if err != nil {
			t.Fatalf("Make() error on iteration %d: %v", i, err)
		}
		if seen[id] {
			t.Fatalf("duplicate ULID on iteration %d: %s", i, id)
		}
		seen[id] = true
	}
}

func TestMake_Sortable(t *testing.T) {
	id1, _ := Make()
	time.Sleep(10 * time.Millisecond)
	id2, _ := Make()

	if id1 >= id2 {
		t.Errorf("first ULID %s should be < second ULID %s", id1, id2)
	}
}

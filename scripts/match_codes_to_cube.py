import numpy as np

# let's try to bruteforce the solution
def generate_3d_array(top, left, front=None):
    # Initialize the 3D array with -1
    array_3d = np.ones((21, 21, 21), dtype=int)

    # Iterate over each element of top projection
    # All empty cells should be empty at each layer of the cube
    for x in range(21):
        for z in range(21):
            if top[z][x]==0:
                for y in range(21):
                    array_3d[x][y][z] = 0

    # Same for left projection
    for y in range(21):
        for z in range(21):
            if left[z][y]==0:
                for x in range(21):
                    array_3d[x][y][z] = 0

    if front is not None:
        # Same for front projection
        for x in range(21):
            for y in range(21):
                if front[y][x]==0:
                    for z in range(21):
                        array_3d[x][y][z] = 0

    # Now we need to check if 1s are correct
    # for each 1s in a projection we need at least one 1 in the corresponding ray in the 3D array

    # Check 1s of top projection
    okay = True
    for x in range(21):
        for z in range(21):
            if top[z][x]==1:
                # Check if there is at least one 1 in the corresponding ray
                if np.max(array_3d[x, :, z])==0:
                    # There is no 1 in the corresponding ray
                    okay = False
                    break
        if not okay:
            break

    # Check 1s of left projection
    for y in range(21):
        for z in range(21):
            if left[z][y]==1:
                # Check if there is at least one 1 in the corresponding ray
                if np.max(array_3d[:, y, z])==0:
                    # There is no 1 in the corresponding ray
                    okay = False
                    break
        if not okay:
            break

    if front is not None:
        # Check 1s of front projection
        for x in range(21):
            for y in range(21):
                if front[y][x]==1:
                    # Check if there is at least one 1 in the corresponding ray
                    if np.max(array_3d[x, y, :])==0:
                        # There is no 1 in the corresponding ray
                        okay = False
                        break
            if not okay:
                break


    return array_3d, okay

from collections import defaultdict
import json

cands = defaultdict(list)

for line in open('candidates.txt'):
    _, c, m = line.split('\t')
    cands[c[0]].append( np.array(json.loads(m)))


print(len(cands), 'projections loaded')
print(len(cands['t']), 'candidate pairs per projection loaded')

cc = 0
for idx,c1 in enumerate(cands['t']):
    print('matching', idx, '/', len(cands['t']))
    for c2 in cands['l']:
        for c3 in cands['f']:
            r, f = generate_3d_array(c1, c2, c3)
            cc += 1
            if f:
                # print(r.tolist())
                print('First match found:')
                print("export const dataArray = ",r.tolist(), ";", sep="")
                exit()

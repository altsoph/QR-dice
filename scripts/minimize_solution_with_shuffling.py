from copy import deepcopy
import numpy as np
from collections import defaultdict
import json

def check_1s(top, left, front, array_3d):
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

def build_projections(array_3d):
    # build top projection from array_3d
    top = np.zeros((21, 21), dtype=int)
    for x in range(21):
        for z in range(21):
            if np.max(array_3d[x, :, z])==1:
                top[z][x] = 1

    # build left projection from array_3d
    left = np.zeros((21, 21), dtype=int)
    for y in range(21):
        for z in range(21):
            if np.max(array_3d[:, y, z])==1:
                left[z][y] = 1

    # build front projection from array_3d
    front = np.zeros((21, 21), dtype=int)
    for x in range(21):
        for y in range(21):
            if np.max(array_3d[x, y, :])==1:
                front[y][x] = 1

    return top, left, front

# let's try to bruteforce the solution
def minimize_solution_greedy(array_3d, top, left, front, ones=None):

    # Now we collect all 1s in the 3D array and will try to greedy remove them until no 1s can be removed
    # Collect all 1s
    if ones is None:
        ones = np.argwhere(array_3d==1)
    # print(ones)
    # Greedy
    print('Checking solution with', len(ones), '1s; pruning...')
    # If there are no 1s, we are done
    if len(ones)==0:
        return array_3d, okay
    # Try to remove 1s
    for x, y, z in ones:
        # Temporarily remove the 1
        array_3d[x][y][z] = 0
        # Check if 1s are still correct
        array_3d, okay = check_1s(top, left, front, array_3d)
        if not okay:
            # If 1s are not correct, we revert the change
            array_3d[x][y][z] = 1
    ones = np.argwhere(array_3d==1)                
    print('finished with solution with', len(ones), '1s')
    return array_3d, len(ones)

# let's try the random order
def minimize_solution_shuffled(array_3d, top, left, front, iters = 10):
    # Now we collect all 1s in the 3D array and will try to greedy remove them until no 1s can be removed
    # Collect all 1s
    array_3d_ = deepcopy(array_3d)
    ones_ = np.argwhere(array_3d==1)

    min_ones = len(ones_)
    min_solution = array_3d_
    print('Random order greedy optimization:')
    for i in range(iters):
        np.random.shuffle(ones_)
        res, ones_num = minimize_solution_greedy(deepcopy(array_3d_), top, left, front, ones=deepcopy(ones_))
        print('finished with randomized solution with', ones_num, '1s')
        if ones_num < min_ones:
            min_ones = ones_num
            min_solution = res
    return min_solution, min_ones


solutions = []

for line in open('some_solutions.jsonl'):
    solutions.append( np.array(json.loads(line)) )

print(len(solutions), 'solutions loaded')

min_ones = 1000
min_sol = None

for s in solutions:
    top, left, front = build_projections(s)
    array_3d, okay = check_1s( deepcopy(top), deepcopy(left), deepcopy(front), deepcopy(s))
    if not okay:
        print('error in solution')
        exit()
    ms, n = minimize_solution_greedy(deepcopy(array_3d), deepcopy(top), deepcopy(left), deepcopy(front))
    if n < min_ones:
        min_ones = n
        min_sol = ms
    ms, n = minimize_solution_shuffled(deepcopy(array_3d), deepcopy(top), deepcopy(left), deepcopy(front))
    if n < min_ones:
        min_ones = n
        min_sol = ms
        print('found better solution with', n, '1s')
        print(min_sol.tolist())

print('found best solution with', min_ones, '1s')
print(min_sol.tolist())


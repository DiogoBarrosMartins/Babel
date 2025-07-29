/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */

function twoSum(nums: number[], target: number): number[] {
    const map = new Map<number, number>();
    for(let i = 0; i < nums.length; i++){
        const complement = target - nums[i];

        if (map.has(complement)){
            return [map.get(complement), i];
        }
        map.set(nums[i],i);
    }
    return [];
};

class BinarySearch{
    search(target: string): string{
        const data: string[] = [];
        if (data.length === 0 ){
            throw Error('No data');
        }

        let left = 0;
        let right = data.length-1;
        while (left <= right){
            const middle = Math.floor((left + right) /2);
            if(data[middle] === target){
            return data[middle]; 
            }
            if(data[middle] < target) left = middle + 1;
            else right = middle - 1 ;
        }
    }
}


interface Location {
    id: string;
    name: string;
    reviews: {userId: string, reviewText: string}[];
    coordinates: { lat: number; long: number; };
}

interface User {
    id: string;
    coordinates: { lat: number; long: number; };
}

class LocationApp {
    private locationsMap: Map<string, Location>;

    constructor() {
        this.locationsMap = new Map();
    }

    add(id: string, location: Location): void {
        if (!location.reviews) {
            location.reviews = [];
        }
        this.locationsMap.set(id, location);
    }

    remove(id:string): void {
        if (this.locationsMap.size === 0) {
        throw new Error('No locations found in the map.');
        }
        if (id) {
        this.locationsMap.delete(id);
        }
    }
    
    addAReview(locationId: string, userId:string, reviewText:string): void {
        if (this.locationsMap.size === 0) {
        throw new Error('No locations found in the map.');
        }
        const location = this.locationsMap.get(locationId);
        if (!location) {
        throw new Error(`Location with ID ${locationId} not found.`);
        }
        location.reviews.push({userId, reviewText});
    }

}

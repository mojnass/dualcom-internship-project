import Address from '../models/address.model.ts'
import type { AddressData } from '../schema/address.schema.ts'

export const createAddressFeature = async (userId: string, data: AddressData) => {
    const address = await Address.create({ ...data, user: userId });
    return address;
}

export const getOwnAddressesFeature = async (userId: string) => {
    const addresses = await Address.find({ user: userId });
    return addresses;
}

export const deleteAddressFeature = async (userId: string, addressId: string) => {
    const address = await Address.findOneAndDelete({ _id: addressId, user: userId });
    if (!address) throw new Error('Address not found');
    return address;
}

import { MinusCircleOutlined, PlusOutlined, ArrowDownOutlined} from '@ant-design/icons';
import React from "react";
import { Button, Form, InputNumber, Select, Space } from 'antd';
const tokenList = ['DAI', 'LINK', 'USDC', 'WBTC', 'WETH', 'USDT', 'AAVE', 'WMATIC', 'CRV', 'SUSHI', 'GHST', 'BAL', 'DPI', 'EURS', 'jEUR', 'agEUR', 'miMATIC', 'stMATIC']
const token = tokenList.map((token) => {
    return { label: token, value: token };
});
let tokenListToIndex = {}
for (let i = 0; i < tokenList.length; i++) {
    tokenListToIndex[tokenList[i]] = i;
}
const txType = [
    {
        label: 'Supply',
        value: 'Supply',
    },
    {
        label: 'Swap',
        value: 'Swap',
    },
    {
        label: 'Borrow',
        value: 'Borrow',
    },
    {
        label: 'FlashLoan',
        value: 'FlashLoan',
    },
    {
        label: 'Repay',
        value: 'Repay',
    },
];
let txTypeToIndex = {}
for (let i = 0; i < txType.length; i++) {
    txTypeToIndex[txType[i].value] = i;
}
const followUpTransaction = {
    WETH: ['Supply', 'Swap', 'Borrow', 'FlashLoan', 'Repay'],
    WMATIC: ['Supply', 'Swap', 'Borrow', 'FlashLoan', 'Repay'],
};


export default function DynamicTable({
    tx,
    writeContracts
}){
    const [form] = Form.useForm();
    const orderUnit = (field, prefix = "") => {
        return (
            <Space 
            // style={{ display: "flex" }}
            align="baseline"
            >
                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                        prevValues.transactionType !== curValues.transactionType || prevValues.token !== curValues.token || prevValues.quantity !== curValues.quantity}
                >
                    {() => (
                        <Form.Item
                            {...field}
                            label={ prefix + "Transaction " + parseInt(field.name + 1)}
                            name={[field.name, 'transactionType']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Missing transaction type',
                                },
                            ]}
                            initialValue={"Supply"}
                        >
                            <Select options={txType} style={{ width: 110 }} defaultValue={"Type"} allowClear={true} onChange={handleChange(field.name)} />
                        </Form.Item>
    
                    )}
                </Form.Item>
                <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, curValues) =>
                        prevValues.transactionType !== curValues.transactionType || prevValues.token !== curValues.token || prevValues.quantity !== curValues.quantity}
                >
                    {() => (
                        <Form.Item
                            {...field}
                            label={"Token"}
                            name={[field.name, 'token']}
                            rules={[
                                {
                                    required: true,
                                    message: 'Missing token',
                                },
                            ]}
                            initialValue={"WMATIC"}
                        >
                            <Select options={token} style={{ width: 110 }} defaultValue={"WMATIC"} allowClear={true} onChange={handleChange(field.name)} />
                        </Form.Item>
    
                    )}
                </Form.Item>
                <Form.Item
                    {...field}
                    label="Quantity"
                    name={[field.name, 'quantity']}
                    rules={[
                        {
                            required: true,
                            message: 'Missing quantity',
                        },
                    ]}
                >
                    <InputNumber defaultValue={0} />
                </Form.Item>
            </Space>);
    };

    const handleChange = () => {
        // form.setFieldsValue({
        //     "quantity": []
        //     });
    };

    return (
        <Form form={form} name="dynamic_form_nest_item" onFinish={async (values) => {
            let compressedString="";
            let totalLength = values.transactions.length;
            compressedString+=totalLength;
            for(const value of values.transactions){
                if (typeof value.subTxs === 'undefined'){
                    compressedString+=",0";
                    console.log("Apple", value.token, tokenListToIndex);
                    compressedString+=","+txTypeToIndex[value.transactionType]+","+tokenListToIndex[value.token]+","+value.quantity;
                } else {
                    compressedString+=","+value.subTxs.length;
                    compressedString+=","+txTypeToIndex[value.transactionType]+","+tokenListToIndex[value.token]+","+value.quantity;
                    for (const subTx of value.subTxs){
                        compressedString+=","+txTypeToIndex[subTx.transactionType]+","+tokenListToIndex[subTx.token]+","+subTx.quantity;
                    }
                }
            }
            /* look how you call setPurpose on your contract: */
            /* notice how you pass a call back for tx updates too */

            const result = tx(writeContracts.YourContract.setPurpose(compressedString), 
            // {value: utils.parseEther("0.001"),}, 
            update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                console.log(" 🍾 Transaction " + update.hash + " finished!");
                console.log(
                    " ⛽️ " +
                    update.gasUsed +
                    "/" +
                    (update.gasLimit || update.gas) +
                    " @ " +
                    parseFloat(update.gasPrice) / 1000000000 +
                    " gwei",
                );
                }
            });
            console.log("awaiting metamask/web3 confirm result...", result);
            console.log(await result);
        }} autoComplete="off">
            <Form.List name="transactions" >
                {(fields, { add, remove }) => (
                    <>
                    <Space
                        align="start"
                        direction="vertical"
                    >
                        {fields.map((field) => (
                            <Space key={field.key} 
                                   align="baseline" 
                                //    style={{ display: "flex" }}
                            >
                                <Button
                                    danger
                                    onClick={() => remove(field.name)}
                                    // style={{ border: 0, width: 15 }}
                                    icon={<MinusCircleOutlined />}
                                ></Button>
                                {orderUnit(field)}
                                <Form.List name={[field.name, "subTxs"]}>
                                    {(subTxs, { add, remove }) => (
                                        <>
                                            {subTxs.map((subTxs) => (
                                                <Space
                                                    key={subTxs.key}
                                                    style={{ display: "flex" }}
                                                    align="center"
                                                >
                                                    <Space
                                                        key={subTxs.key+"_OrderUnit"}
                                                        // style={{ display: "flex" }}
                                                        align="center"
                                                        direction="vertical"
                                                    >   
                                                    {subTxs.name? <ArrowDownOutlined />:''}
                                                    {orderUnit(subTxs, "Sub ")}
                                                    </Space>
                                                    <MinusCircleOutlined onClick={() => {
                                                        remove(subTxs.name)
                                                    }} />
                                                </Space>
                                            ))}
                                            <Form.Item>
                                                <Button
                                                    shape="round"
                                                    type="dashed"
                                                    onClick={() => add()}
                                                    icon={<PlusOutlined />}
                                                >
                                                    Add sub-transaction for transactions {parseInt(field.name)+1}
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </Space>
                        ))}
                        </Space>
                        <Form.Item>
                            <Button type="default" onClick={() => add()} block icon={<PlusOutlined />}>
                                Add new transaction
                            </Button>
                        </Form.Item>
                    </>
                )}
            </Form.List>
            <Form.Item>
                <Button type="primary" htmlType="submit" size="large">
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
};

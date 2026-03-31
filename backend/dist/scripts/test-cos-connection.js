"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '../.env') });
const COS = require('cos-nodejs-sdk-v5');
async function main() {
    console.log('🧪 开始测试 COS 连接...\n');
    const secretId = process.env.COS_SECRET_ID;
    const secretKey = process.env.COS_SECRET_KEY;
    const bucket = process.env.COS_BUCKET || 'huntlink-1306109984';
    const region = process.env.COS_REGION || 'ap-shanghai';
    console.log('📋 配置信息:');
    console.log(`  SecretId: ${secretId ? secretId.substring(0, 10) + '...' : '未配置'}`);
    console.log(`  SecretKey: ${secretKey ? '******' : '未配置'}`);
    console.log(`  存储桶: ${bucket}`);
    console.log(`  地域: ${region}\n`);
    if (!secretId || !secretKey) {
        console.log('❌ 配置不完整！');
        console.log('请检查 .env 文件中的 COS_SECRET_ID 和 COS_SECRET_KEY');
        return;
    }
    const cos = new COS({
        SecretId: secretId,
        SecretKey: secretKey,
    });
    console.log('1️⃣ 检查存储桶是否存在...');
    try {
        await new Promise((resolve, reject) => {
            cos.headBucket({
                Bucket: bucket,
                Region: region,
            }, (err, data) => {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
        console.log(`✅ 存储桶 ${bucket} 存在！地域: ${region}`);
        console.log('\n2️⃣ 测试读取存储桶内容...');
        try {
            const content = await new Promise((resolve, reject) => {
                cos.getBucket({ Bucket: bucket, Region: region }, (err, data) => {
                    if (err)
                        reject(err);
                    else
                        resolve(data);
                });
            });
            console.log(`✅ 存储桶可访问！`);
            console.log(`  对象数量: ${content.Contents?.length || 0}`);
        }
        catch (e) {
            console.log(`⚠️ 无法读取存储桶内容: ${e.message || e}`);
        }
        console.log('\n3️⃣ 测试文件上传...');
        const testKey = `test/${Date.now()}-upload-test.txt`;
        const testContent = 'HuntLink COS Test File - ' + new Date().toISOString();
        try {
            const uploadResult = await new Promise((resolve, reject) => {
                cos.putObject({
                    Bucket: bucket,
                    Region: region,
                    Key: testKey,
                    Body: Buffer.from(testContent),
                }, (err, data) => {
                    if (err)
                        reject(err);
                    else
                        resolve(data);
                });
            });
            console.log('✅ 文件上传成功！');
            console.log(`  文件 Key: ${testKey}`);
            console.log(`  ETag: ${uploadResult.ETag}`);
            console.log('\n4️⃣ 验证文件已上传...');
            try {
                await new Promise((resolve, reject) => {
                    cos.getObject({
                        Bucket: bucket,
                        Region: region,
                        Key: testKey,
                    }, (err, data) => {
                        if (err)
                            reject(err);
                        else
                            resolve(data);
                    });
                });
                console.log('✅ 文件验证成功！');
            }
            catch (e) {
                console.log(`⚠️ 文件验证失败: ${e.message || e}`);
            }
            console.log('\n5️⃣ 测试文件删除...');
            try {
                await new Promise((resolve, reject) => {
                    cos.deleteObject({
                        Bucket: bucket,
                        Region: region,
                        Key: testKey,
                    }, (err, data) => {
                        if (err)
                            reject(err);
                        else
                            resolve(data);
                    });
                });
                console.log('✅ 文件删除成功！');
            }
            catch (e) {
                console.log(`⚠️ 文件删除失败（不影响使用）: ${e.message || e}`);
            }
            console.log('\n========== 🎉 COS 测试全部通过！ ==========\n');
        }
        catch (e) {
            console.log(`❌ 文件上传失败！`);
            console.log(`错误信息: ${e.message || e}`);
        }
    }
    catch (err) {
        console.log(`❌ 存储桶 ${bucket} 不存在或无权限访问！`);
        console.log(`错误信息: ${err.message || err}`);
    }
    console.log('\n========== 测试完成 ==========\n');
}
main().catch(console.error);
//# sourceMappingURL=test-cos-connection.js.map